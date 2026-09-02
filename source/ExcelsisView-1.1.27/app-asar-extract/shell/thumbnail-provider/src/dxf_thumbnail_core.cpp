#include "dxf_thumbnail_core.h"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <limits>
#include <new>
#include <string>
#include <string_view>
#include <unordered_map>
#include <utility>
#include <vector>

namespace excelsis::thumbnail {
namespace {

constexpr double kPi = 3.1415926535897932384626433832795;
constexpr std::size_t kMaxLineBytes = 1024u * 1024u;
constexpr std::size_t kMaxPaths = 30000u;
constexpr std::size_t kMaxBlockDepth = 8u;
constexpr int kMaxInsertArray = 64;
constexpr COLORREF kBackground = RGB(253, 248, 248);
constexpr COLORREF kLineColor = RGB(20, 20, 20);

struct Point {
  double x = 0.0;
  double y = 0.0;
};

struct Matrix {
  double a = 1.0;
  double b = 0.0;
  double c = 0.0;
  double d = 1.0;
  double tx = 0.0;
  double ty = 0.0;
};

struct Pair {
  int code = 0;
  std::string value;
};

enum class EntityKind {
  kUnsupported,
  kLine,
  kPolyline,
  kCircle,
  kArc,
  kEllipse,
  kSpline,
  kInsert,
  kPoint,
};

struct Entity {
  EntityKind kind = EntityKind::kUnsupported;
  std::vector<Point> points;
  std::vector<double> bulges;
  bool closed = false;
  Point center;
  Point majorAxis;
  double radius = 0.0;
  double start = 0.0;
  double end = 0.0;
  double ratio = 1.0;
  std::string blockName;
  Point insertion;
  double scaleX = 1.0;
  double scaleY = 1.0;
  double rotation = 0.0;
  int columns = 1;
  int rows = 1;
  double columnSpacing = 0.0;
  double rowSpacing = 0.0;
};

struct Block {
  Point base;
  std::vector<Entity> entities;
};

struct Path {
  std::vector<Point> points;
  bool closed = false;
};

struct Scene {
  std::vector<Path> paths;
  std::size_t pointCount = 0;
  std::size_t flattenWork = 0;
  bool limitExceeded = false;
};

struct Bounds {
  double minX = std::numeric_limits<double>::infinity();
  double minY = std::numeric_limits<double>::infinity();
  double maxX = -std::numeric_limits<double>::infinity();
  double maxY = -std::numeric_limits<double>::infinity();

  void Include(Point point) {
    minX = std::min(minX, point.x);
    minY = std::min(minY, point.y);
    maxX = std::max(maxX, point.x);
    maxY = std::max(maxY, point.y);
  }

  bool Valid() const {
    return std::isfinite(minX) && std::isfinite(minY) &&
           std::isfinite(maxX) && std::isfinite(maxY);
  }
};

std::string_view Trim(std::string_view value) {
  while (!value.empty() && (value.front() == ' ' || value.front() == '\t' || value.front() == '\r')) {
    value.remove_prefix(1);
  }
  while (!value.empty() && (value.back() == ' ' || value.back() == '\t' || value.back() == '\r')) {
    value.remove_suffix(1);
  }
  return value;
}

std::string UpperAscii(std::string_view value) {
  std::string result;
  result.reserve(value.size());
  for (const unsigned char character : value) {
    result.push_back(character >= 'a' && character <= 'z'
        ? static_cast<char>(character - ('a' - 'A'))
        : static_cast<char>(character));
  }
  return result;
}

bool ParseInteger(std::string_view text, int* output) {
  text = Trim(text);
  if (text.empty()) return false;
  bool negative = false;
  std::size_t index = 0;
  if (text[index] == '+' || text[index] == '-') {
    negative = text[index] == '-';
    ++index;
  }
  if (index == text.size()) return false;
  long long value = 0;
  for (; index < text.size(); ++index) {
    const char character = text[index];
    if (character < '0' || character > '9') return false;
    value = value * 10 + (character - '0');
    if (value > std::numeric_limits<int>::max()) return false;
  }
  *output = static_cast<int>(negative ? -value : value);
  return true;
}

bool ParseNumber(std::string_view text, double* output) {
  text = Trim(text);
  if (text.empty()) return false;
  std::size_t index = 0;
  bool negative = false;
  if (text[index] == '+' || text[index] == '-') {
    negative = text[index] == '-';
    ++index;
  }
  bool hasDigits = false;
  long double value = 0.0;
  while (index < text.size() && text[index] >= '0' && text[index] <= '9') {
    hasDigits = true;
    value = value * 10.0 + (text[index++] - '0');
  }
  if (index < text.size() && text[index] == '.') {
    ++index;
    long double factor = 0.1;
    while (index < text.size() && text[index] >= '0' && text[index] <= '9') {
      hasDigits = true;
      value += (text[index++] - '0') * factor;
      factor *= 0.1;
    }
  }
  if (!hasDigits) return false;
  int exponent = 0;
  bool exponentNegative = false;
  if (index < text.size() && (text[index] == 'e' || text[index] == 'E')) {
    ++index;
    if (index < text.size() && (text[index] == '+' || text[index] == '-')) {
      exponentNegative = text[index] == '-';
      ++index;
    }
    const std::size_t exponentStart = index;
    while (index < text.size() && text[index] >= '0' && text[index] <= '9') {
      exponent = std::min(400, exponent * 10 + (text[index++] - '0'));
    }
    if (index == exponentStart) return false;
  }
  if (index != text.size()) return false;
  if (exponent != 0) value *= std::pow(10.0L, exponentNegative ? -exponent : exponent);
  if (negative) value = -value;
  const double converted = static_cast<double>(value);
  if (!std::isfinite(converted)) return false;
  *output = converted;
  return true;
}

bool NextLine(const std::uint8_t* data, std::size_t size, std::size_t* cursor, std::string_view* line) {
  if (*cursor >= size) return false;
  const std::size_t start = *cursor;
  while (*cursor < size && data[*cursor] != '\n' && data[*cursor] != '\r') {
    if (data[*cursor] == 0 || *cursor - start > kMaxLineBytes) return false;
    ++*cursor;
  }
  const std::size_t end = *cursor;
  if (*cursor < size && data[*cursor] == '\r') ++*cursor;
  if (*cursor < size && data[*cursor] == '\n') ++*cursor;
  *line = std::string_view(reinterpret_cast<const char*>(data + start), end - start);
  return true;
}

HRESULT ParsePairs(const std::uint8_t* data, std::size_t size, std::vector<Pair>* pairs) {
  if (data == nullptr || size == 0) return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);
  if (size > kMaxInputBytes) return HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE);
  constexpr std::string_view kBinaryMarker = "AutoCAD Binary DXF";
  if (size >= kBinaryMarker.size() &&
      std::string_view(reinterpret_cast<const char*>(data), kBinaryMarker.size()) == kBinaryMarker) {
    return HRESULT_FROM_WIN32(ERROR_NOT_SUPPORTED);
  }

  std::size_t cursor = 0;
  if (size >= 3 && data[0] == 0xef && data[1] == 0xbb && data[2] == 0xbf) cursor = 3;
  std::string_view codeLine;
  std::string_view valueLine;
  while (NextLine(data, size, &cursor, &codeLine)) {
    if (!NextLine(data, size, &cursor, &valueLine)) return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);
    if (pairs->size() >= kMaxPairs) return HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE);
    int code = 0;
    if (!ParseInteger(codeLine, &code) || code < -5 || code > 1071) {
      return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);
    }
    if (valueLine.size() > kMaxLineBytes) return HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE);
    pairs->push_back(Pair{code, std::string(Trim(valueLine))});
  }
  if (cursor < size) return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);
  if (pairs->empty()) return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);
  return S_OK;
}

std::size_t NextEntity(const std::vector<Pair>& pairs, std::size_t start, std::size_t limit) {
  std::size_t cursor = start + 1;
  while (cursor < limit && pairs[cursor].code != 0) ++cursor;
  return cursor;
}

bool IsPaperSpace(const std::vector<Pair>& pairs, std::size_t start, std::size_t end) {
  for (std::size_t i = start + 1; i < end; ++i) {
    if (pairs[i].code == 67) {
      int value = 0;
      if (ParseInteger(pairs[i].value, &value) && value == 1) return true;
    }
    if (pairs[i].code == 410 && UpperAscii(Trim(pairs[i].value)) != "MODEL") return true;
  }
  return false;
}

bool ReadFirstNumber(
    const std::vector<Pair>& pairs,
    std::size_t start,
    std::size_t end,
    int code,
    double* output) {
  for (std::size_t i = start + 1; i < end; ++i) {
    if (pairs[i].code == code && ParseNumber(pairs[i].value, output)) return true;
  }
  return false;
}

bool ReadFirstInteger(
    const std::vector<Pair>& pairs,
    std::size_t start,
    std::size_t end,
    int code,
    int* output) {
  for (std::size_t i = start + 1; i < end; ++i) {
    if (pairs[i].code == code && ParseInteger(pairs[i].value, output)) return true;
  }
  return false;
}

std::string ReadFirstString(
    const std::vector<Pair>& pairs,
    std::size_t start,
    std::size_t end,
    int code) {
  for (std::size_t i = start + 1; i < end; ++i) {
    if (pairs[i].code == code) return UpperAscii(Trim(pairs[i].value));
  }
  return {};
}

bool ValidPoint(Point point) {
  return std::isfinite(point.x) && std::isfinite(point.y) &&
         std::abs(point.x) <= 1.0e12 && std::abs(point.y) <= 1.0e12;
}

Entity ParseSimpleEntity(
    const std::vector<Pair>& pairs,
    std::size_t start,
    std::size_t end,
    std::string_view type) {
  Entity entity;
  if (IsPaperSpace(pairs, start, end)) return entity;

  if (type == "LINE") {
    Point first;
    Point second;
    if (ReadFirstNumber(pairs, start, end, 10, &first.x) &&
        ReadFirstNumber(pairs, start, end, 20, &first.y) &&
        ReadFirstNumber(pairs, start, end, 11, &second.x) &&
        ReadFirstNumber(pairs, start, end, 21, &second.y) &&
        ValidPoint(first) && ValidPoint(second)) {
      entity.kind = EntityKind::kLine;
      entity.points = {first, second};
    }
  } else if (type == "LWPOLYLINE") {
    entity.kind = EntityKind::kPolyline;
    int flags = 0;
    ReadFirstInteger(pairs, start, end, 70, &flags);
    entity.closed = (flags & 1) != 0;
    for (std::size_t i = start + 1; i < end; ++i) {
      if (pairs[i].code == 10) {
        double x = 0.0;
        if (ParseNumber(pairs[i].value, &x)) {
          entity.points.push_back(Point{x, 0.0});
          entity.bulges.push_back(0.0);
        }
      } else if (pairs[i].code == 20 && !entity.points.empty()) {
        ParseNumber(pairs[i].value, &entity.points.back().y);
      } else if (pairs[i].code == 42 && !entity.bulges.empty()) {
        ParseNumber(pairs[i].value, &entity.bulges.back());
      }
    }
    if (entity.points.size() < 2 ||
        !std::all_of(entity.points.begin(), entity.points.end(), ValidPoint)) {
      entity.kind = EntityKind::kUnsupported;
    }
  } else if (type == "CIRCLE" || type == "ARC") {
    if (ReadFirstNumber(pairs, start, end, 10, &entity.center.x) &&
        ReadFirstNumber(pairs, start, end, 20, &entity.center.y) &&
        ReadFirstNumber(pairs, start, end, 40, &entity.radius) &&
        ValidPoint(entity.center) && entity.radius > 0.0 && entity.radius <= 1.0e12) {
      entity.kind = type == "CIRCLE" ? EntityKind::kCircle : EntityKind::kArc;
      if (entity.kind == EntityKind::kArc) {
        if (!ReadFirstNumber(pairs, start, end, 50, &entity.start) ||
            !ReadFirstNumber(pairs, start, end, 51, &entity.end) ||
            std::abs(entity.start) > 1.0e9 || std::abs(entity.end) > 1.0e9) {
          entity.kind = EntityKind::kUnsupported;
        } else {
          entity.start *= kPi / 180.0;
          entity.end *= kPi / 180.0;
        }
      }
    }
  } else if (type == "ELLIPSE") {
    if (ReadFirstNumber(pairs, start, end, 10, &entity.center.x) &&
        ReadFirstNumber(pairs, start, end, 20, &entity.center.y) &&
        ReadFirstNumber(pairs, start, end, 11, &entity.majorAxis.x) &&
        ReadFirstNumber(pairs, start, end, 21, &entity.majorAxis.y) &&
        ReadFirstNumber(pairs, start, end, 40, &entity.ratio) &&
        ValidPoint(entity.center) && ValidPoint(entity.majorAxis) &&
        entity.ratio > 0.0 && entity.ratio <= 1.0e6) {
      entity.kind = EntityKind::kEllipse;
      entity.start = 0.0;
      entity.end = 2.0 * kPi;
      ReadFirstNumber(pairs, start, end, 41, &entity.start);
      ReadFirstNumber(pairs, start, end, 42, &entity.end);
      if (std::abs(entity.start) > 1.0e9 || std::abs(entity.end) > 1.0e9) {
        entity.kind = EntityKind::kUnsupported;
      }
    }
  } else if (type == "SPLINE") {
    entity.kind = EntityKind::kSpline;
    int flags = 0;
    ReadFirstInteger(pairs, start, end, 70, &flags);
    entity.closed = (flags & 1) != 0;
    int xCode = 11;
    bool hasFitPoints = false;
    for (std::size_t i = start + 1; i < end; ++i) {
      if (pairs[i].code == 11) {
        hasFitPoints = true;
        break;
      }
    }
    if (!hasFitPoints) xCode = 10;
    for (std::size_t i = start + 1; i < end; ++i) {
      if (pairs[i].code == xCode) {
        double x = 0.0;
        if (ParseNumber(pairs[i].value, &x)) entity.points.push_back(Point{x, 0.0});
      } else if (pairs[i].code == xCode + 10 && !entity.points.empty()) {
        ParseNumber(pairs[i].value, &entity.points.back().y);
      }
    }
    if (entity.points.size() < 2 ||
        !std::all_of(entity.points.begin(), entity.points.end(), ValidPoint)) {
      entity.kind = EntityKind::kUnsupported;
    }
  } else if (type == "POINT") {
    if (ReadFirstNumber(pairs, start, end, 10, &entity.center.x) &&
        ReadFirstNumber(pairs, start, end, 20, &entity.center.y) && ValidPoint(entity.center)) {
      entity.kind = EntityKind::kPoint;
    }
  } else if (type == "SOLID" || type == "TRACE" || type == "3DFACE") {
    entity.kind = EntityKind::kPolyline;
    entity.closed = true;
    for (int offset = 0; offset < 4; ++offset) {
      Point point;
      if (ReadFirstNumber(pairs, start, end, 10 + offset, &point.x) &&
          ReadFirstNumber(pairs, start, end, 20 + offset, &point.y) && ValidPoint(point)) {
        if (entity.points.empty() || point.x != entity.points.back().x || point.y != entity.points.back().y) {
          entity.points.push_back(point);
        }
      }
    }
    if (entity.points.size() < 2) entity.kind = EntityKind::kUnsupported;
  } else if (type == "INSERT" || type == "DIMENSION") {
    entity.blockName = ReadFirstString(pairs, start, end, 2);
    if (!entity.blockName.empty()) {
      entity.kind = EntityKind::kInsert;
      ReadFirstNumber(pairs, start, end, 10, &entity.insertion.x);
      ReadFirstNumber(pairs, start, end, 20, &entity.insertion.y);
      ReadFirstNumber(pairs, start, end, 41, &entity.scaleX);
      ReadFirstNumber(pairs, start, end, 42, &entity.scaleY);
      ReadFirstNumber(pairs, start, end, 50, &entity.rotation);
      ReadFirstInteger(pairs, start, end, 70, &entity.columns);
      ReadFirstInteger(pairs, start, end, 71, &entity.rows);
      ReadFirstNumber(pairs, start, end, 44, &entity.columnSpacing);
      ReadFirstNumber(pairs, start, end, 45, &entity.rowSpacing);
      if (!ValidPoint(entity.insertion) || !std::isfinite(entity.scaleX) || !std::isfinite(entity.scaleY) ||
          entity.scaleX == 0.0 || entity.scaleY == 0.0 ||
          std::abs(entity.scaleX) > 1.0e12 || std::abs(entity.scaleY) > 1.0e12 ||
          std::abs(entity.rotation) > 1.0e9 ||
          !std::isfinite(entity.columnSpacing) || !std::isfinite(entity.rowSpacing) ||
          std::abs(entity.columnSpacing) > 1.0e12 || std::abs(entity.rowSpacing) > 1.0e12) {
        entity.kind = EntityKind::kUnsupported;
      }
      entity.rotation *= kPi / 180.0;
      entity.columns = std::clamp(entity.columns, 1, kMaxInsertArray);
      entity.rows = std::clamp(entity.rows, 1, kMaxInsertArray);
    }
  }
  return entity;
}

Entity ParsePolyline(
    const std::vector<Pair>& pairs,
    std::size_t start,
    std::size_t limit,
    std::size_t* next) {
  Entity entity;
  entity.kind = EntityKind::kPolyline;
  const std::size_t headerEnd = NextEntity(pairs, start, limit);
  int flags = 0;
  ReadFirstInteger(pairs, start, headerEnd, 70, &flags);
  entity.closed = (flags & 1) != 0;
  std::size_t cursor = headerEnd;
  while (cursor < limit && pairs[cursor].code == 0) {
    const std::string type = UpperAscii(Trim(pairs[cursor].value));
    const std::size_t end = NextEntity(pairs, cursor, limit);
    if (type == "VERTEX") {
      Point point;
      double bulge = 0.0;
      if (ReadFirstNumber(pairs, cursor, end, 10, &point.x) &&
          ReadFirstNumber(pairs, cursor, end, 20, &point.y) && ValidPoint(point)) {
        ReadFirstNumber(pairs, cursor, end, 42, &bulge);
        entity.points.push_back(point);
        entity.bulges.push_back(std::isfinite(bulge) ? bulge : 0.0);
      }
      cursor = end;
      continue;
    }
    if (type == "SEQEND") {
      cursor = end;
    }
    break;
  }
  *next = cursor;
  if (entity.points.size() < 2) entity.kind = EntityKind::kUnsupported;
  return entity;
}

void AddEntity(
    const std::vector<Pair>& pairs,
    std::size_t* cursor,
    std::size_t limit,
    std::vector<Entity>* entities,
    std::size_t* entityCount) {
  if (*entityCount >= kMaxEntities || *cursor >= limit || pairs[*cursor].code != 0) {
    if (*entityCount >= kMaxEntities) *entityCount = kMaxEntities + 1u;
    *cursor = limit;
    return;
  }
  const std::string type = UpperAscii(Trim(pairs[*cursor].value));
  std::size_t next = NextEntity(pairs, *cursor, limit);
  Entity entity;
  if (type == "POLYLINE") {
    entity = ParsePolyline(pairs, *cursor, limit, &next);
  } else {
    entity = ParseSimpleEntity(pairs, *cursor, next, type);
  }
  ++*entityCount;
  if (entity.kind != EntityKind::kUnsupported) entities->push_back(std::move(entity));
  *cursor = next;
}

HRESULT ParseDocument(
    const std::vector<Pair>& pairs,
    std::vector<Entity>* modelEntities,
    std::unordered_map<std::string, Block>* blocks,
    std::size_t* entityCount) {
  std::size_t cursor = 0;
  while (cursor < pairs.size()) {
    if (pairs[cursor].code != 0 || UpperAscii(Trim(pairs[cursor].value)) != "SECTION") {
      ++cursor;
      continue;
    }
    if (cursor + 1 >= pairs.size() || pairs[cursor + 1].code != 2) return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);
    const std::string section = UpperAscii(Trim(pairs[cursor + 1].value));
    std::size_t sectionEnd = cursor + 2;
    while (sectionEnd < pairs.size() &&
           !(pairs[sectionEnd].code == 0 && UpperAscii(Trim(pairs[sectionEnd].value)) == "ENDSEC")) {
      ++sectionEnd;
    }
    if (sectionEnd == pairs.size()) return HRESULT_FROM_WIN32(ERROR_BAD_FORMAT);

    if (section == "ENTITIES") {
      std::size_t entityCursor = cursor + 2;
      while (entityCursor < sectionEnd) {
        if (pairs[entityCursor].code == 0) {
          AddEntity(pairs, &entityCursor, sectionEnd, modelEntities, entityCount);
        } else {
          ++entityCursor;
        }
        if (*entityCount > kMaxEntities) return HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE);
      }
    } else if (section == "BLOCKS") {
      std::size_t blockCursor = cursor + 2;
      while (blockCursor < sectionEnd) {
        if (pairs[blockCursor].code != 0 || UpperAscii(Trim(pairs[blockCursor].value)) != "BLOCK") {
          ++blockCursor;
          continue;
        }
        const std::size_t headerEnd = NextEntity(pairs, blockCursor, sectionEnd);
        Block block;
        std::string name = ReadFirstString(pairs, blockCursor, headerEnd, 2);
        if (name.empty()) name = ReadFirstString(pairs, blockCursor, headerEnd, 3);
        ReadFirstNumber(pairs, blockCursor, headerEnd, 10, &block.base.x);
        ReadFirstNumber(pairs, blockCursor, headerEnd, 20, &block.base.y);
        std::size_t entityCursor = headerEnd;
        while (entityCursor < sectionEnd) {
          if (pairs[entityCursor].code == 0 && UpperAscii(Trim(pairs[entityCursor].value)) == "ENDBLK") {
            entityCursor = NextEntity(pairs, entityCursor, sectionEnd);
            break;
          }
          if (pairs[entityCursor].code == 0) {
            AddEntity(pairs, &entityCursor, sectionEnd, &block.entities, entityCount);
          } else {
            ++entityCursor;
          }
          if (*entityCount > kMaxEntities) return HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE);
        }
        if (!name.empty() && ValidPoint(block.base)) {
          if (blocks->size() >= 5000u && blocks->find(name) == blocks->end()) {
            return HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE);
          }
          (*blocks)[name] = std::move(block);
        }
        blockCursor = entityCursor;
      }
    }
    cursor = sectionEnd + 1;
  }
  return S_OK;
}

Matrix Multiply(const Matrix& left, const Matrix& right) {
  return Matrix{
      left.a * right.a + left.c * right.b,
      left.b * right.a + left.d * right.b,
      left.a * right.c + left.c * right.d,
      left.b * right.c + left.d * right.d,
      left.a * right.tx + left.c * right.ty + left.tx,
      left.b * right.tx + left.d * right.ty + left.ty,
  };
}

Point Transform(const Matrix& matrix, Point point) {
  return Point{
      matrix.a * point.x + matrix.c * point.y + matrix.tx,
      matrix.b * point.x + matrix.d * point.y + matrix.ty,
  };
}

Matrix InsertMatrix(const Entity& entity, const Block& block, int column, int row) {
  const double cosine = std::cos(entity.rotation);
  const double sine = std::sin(entity.rotation);
  const double localX = -block.base.x + column * entity.columnSpacing;
  const double localY = -block.base.y + row * entity.rowSpacing;
  Matrix matrix;
  matrix.a = cosine * entity.scaleX;
  matrix.b = sine * entity.scaleX;
  matrix.c = -sine * entity.scaleY;
  matrix.d = cosine * entity.scaleY;
  matrix.tx = entity.insertion.x + matrix.a * localX + matrix.c * localY;
  matrix.ty = entity.insertion.y + matrix.b * localX + matrix.d * localY;
  return matrix;
}

bool AddPath(Scene* scene, std::vector<Point> points, bool closed) {
  if (points.size() < 2 || scene->paths.size() >= kMaxPaths ||
      points.size() > kMaxRenderPoints - scene->pointCount) {
    if (points.size() >= 2) scene->limitExceeded = true;
    return false;
  }
  for (const Point point : points) {
    if (!ValidPoint(point)) return false;
  }
  scene->pointCount += points.size();
  scene->paths.push_back(Path{std::move(points), closed});
  return true;
}

bool ConsumeFlattenWork(Scene* scene, std::size_t amount = 1u) {
  if (amount > kMaxFlattenWork - scene->flattenWork) {
    scene->limitExceeded = true;
    return false;
  }
  scene->flattenWork += amount;
  return true;
}

double NormalizeAngle(double angle) {
  double normalized = std::fmod(angle, 2.0 * kPi);
  if (normalized < 0.0) normalized += 2.0 * kPi;
  return normalized;
}

double PositiveSweep(double start, double end) {
  double sweep = std::fmod(end - start, 2.0 * kPi);
  if (sweep <= 0.0) sweep += 2.0 * kPi;
  return sweep;
}

void AppendArcPoints(
    std::vector<Point>* points,
    Point center,
    double radius,
    double start,
    double sweep,
    int minimumSegments = 8) {
  const int segments = std::clamp(
      static_cast<int>(std::ceil(std::abs(sweep) / (2.0 * kPi) * 96.0)),
      minimumSegments,
      128);
  for (int i = 0; i <= segments; ++i) {
    const double angle = start + sweep * static_cast<double>(i) / segments;
    points->push_back(Point{center.x + radius * std::cos(angle), center.y + radius * std::sin(angle)});
  }
}

std::vector<Point> SamplePolyline(const Entity& entity, std::size_t maxPoints, bool* exceeded) {
  std::vector<Point> result;
  if (entity.points.empty()) return result;
  result.push_back(entity.points.front());
  const std::size_t segmentCount = entity.closed ? entity.points.size() : entity.points.size() - 1;
  for (std::size_t i = 0; i < segmentCount; ++i) {
    const Point first = entity.points[i];
    const Point second = entity.points[(i + 1) % entity.points.size()];
    const double bulge = i < entity.bulges.size() ? entity.bulges[i] : 0.0;
    const double dx = second.x - first.x;
    const double dy = second.y - first.y;
    const double chord = std::hypot(dx, dy);
    if (std::abs(bulge) < 1.0e-10 || chord < 1.0e-12 || !std::isfinite(bulge)) {
      if (result.size() >= maxPoints) {
        *exceeded = true;
        return {};
      }
      result.push_back(second);
      continue;
    }
    const double sweep = 4.0 * std::atan(bulge);
    const double centerOffset = chord * (1.0 - bulge * bulge) / (4.0 * bulge);
    const Point midpoint{(first.x + second.x) * 0.5, (first.y + second.y) * 0.5};
    const Point center{
        midpoint.x - dy / chord * centerOffset,
        midpoint.y + dx / chord * centerOffset,
    };
    const double radius = std::hypot(first.x - center.x, first.y - center.y);
    const double start = std::atan2(first.y - center.y, first.x - center.x);
    std::vector<Point> arc;
    AppendArcPoints(&arc, center, radius, start, sweep, 4);
    const std::size_t additional = arc.empty() ? 0u : arc.size() - 1u;
    if (additional > maxPoints - result.size()) {
      *exceeded = true;
      return {};
    }
    if (!arc.empty()) result.insert(result.end(), arc.begin() + 1, arc.end());
  }
  return result;
}

void FlattenEntities(
    const std::vector<Entity>& entities,
    const std::unordered_map<std::string, Block>& blocks,
    const Matrix& transform,
    std::size_t depth,
    Scene* scene) {
  if (depth > kMaxBlockDepth || scene->pointCount >= kMaxRenderPoints) {
    scene->limitExceeded = true;
    return;
  }
  for (const Entity& entity : entities) {
    if (scene->limitExceeded || scene->paths.size() >= kMaxPaths || scene->pointCount >= kMaxRenderPoints) {
      scene->limitExceeded = true;
      return;
    }
    if (!ConsumeFlattenWork(scene)) return;
    std::vector<Point> points;
    bool closed = false;
    switch (entity.kind) {
      case EntityKind::kLine:
        points = entity.points;
        break;
      case EntityKind::kPolyline:
        points = SamplePolyline(
            entity,
            kMaxRenderPoints - scene->pointCount,
            &scene->limitExceeded);
        if (scene->limitExceeded) return;
        closed = entity.closed;
        break;
      case EntityKind::kCircle:
        AppendArcPoints(&points, entity.center, entity.radius, 0.0, 2.0 * kPi, 24);
        closed = true;
        break;
      case EntityKind::kArc: {
        const double start = NormalizeAngle(entity.start);
        const double sweep = PositiveSweep(entity.start, entity.end);
        AppendArcPoints(&points, entity.center, entity.radius, start, sweep);
        break;
      }
      case EntityKind::kEllipse: {
        const double start = NormalizeAngle(entity.start);
        const double sweep = PositiveSweep(entity.start, entity.end);
        const int segments = std::clamp(static_cast<int>(std::ceil(sweep / (2.0 * kPi) * 96.0)), 12, 128);
        for (int i = 0; i <= segments; ++i) {
          const double parameter = start + sweep * static_cast<double>(i) / segments;
          points.push_back(Point{
              entity.center.x + entity.majorAxis.x * std::cos(parameter) -
                  entity.majorAxis.y * entity.ratio * std::sin(parameter),
              entity.center.y + entity.majorAxis.y * std::cos(parameter) +
                  entity.majorAxis.x * entity.ratio * std::sin(parameter),
          });
        }
        closed = std::abs(sweep - 2.0 * kPi) < 1.0e-6;
        break;
      }
      case EntityKind::kSpline:
        points = entity.points;
        closed = entity.closed;
        break;
      case EntityKind::kPoint: {
        constexpr double kPointMark = 0.5;
        points = {
            Point{entity.center.x - kPointMark, entity.center.y},
            Point{entity.center.x + kPointMark, entity.center.y},
        };
        break;
      }
      case EntityKind::kInsert: {
        const auto found = blocks.find(entity.blockName);
        if (found != blocks.end() && depth < kMaxBlockDepth) {
          const std::size_t instanceCount =
              static_cast<std::size_t>(entity.rows) * static_cast<std::size_t>(entity.columns);
          if (!ConsumeFlattenWork(scene, instanceCount)) return;
          for (int row = 0; row < entity.rows; ++row) {
            for (int column = 0; column < entity.columns; ++column) {
              const Matrix nested = Multiply(transform, InsertMatrix(entity, found->second, column, row));
              FlattenEntities(found->second.entities, blocks, nested, depth + 1, scene);
              if (scene->limitExceeded) return;
            }
          }
        }
        continue;
      }
      case EntityKind::kUnsupported:
        continue;
    }
    for (Point& point : points) point = Transform(transform, point);
    AddPath(scene, std::move(points), closed);
  }
}

HBITMAP CreateThumbnailBitmap(const Scene& scene, UINT pixels) {
  BITMAPINFO bitmapInfo{};
  bitmapInfo.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
  bitmapInfo.bmiHeader.biWidth = static_cast<LONG>(pixels);
  bitmapInfo.bmiHeader.biHeight = -static_cast<LONG>(pixels);
  bitmapInfo.bmiHeader.biPlanes = 1;
  bitmapInfo.bmiHeader.biBitCount = 32;
  bitmapInfo.bmiHeader.biCompression = BI_RGB;
  void* bits = nullptr;
  HBITMAP bitmap = CreateDIBSection(nullptr, &bitmapInfo, DIB_RGB_COLORS, &bits, nullptr, 0);
  if (bitmap == nullptr || bits == nullptr) return nullptr;

  HDC dc = CreateCompatibleDC(nullptr);
  if (dc == nullptr) {
    DeleteObject(bitmap);
    return nullptr;
  }
  const HGDIOBJ oldBitmap = SelectObject(dc, bitmap);
  RECT canvas{0, 0, static_cast<LONG>(pixels), static_cast<LONG>(pixels)};
  HBRUSH background = CreateSolidBrush(kBackground);
  FillRect(dc, &canvas, background);
  DeleteObject(background);

  Bounds bounds;
  for (const Path& path : scene.paths) {
    for (const Point point : path.points) bounds.Include(point);
  }

  if (bounds.Valid() && !scene.paths.empty()) {
    const double width = std::max(bounds.maxX - bounds.minX, 1.0e-9);
    const double height = std::max(bounds.maxY - bounds.minY, 1.0e-9);
    const double margin = std::max(4.0, pixels * 0.07);
    const double available = std::max(1.0, pixels - margin * 2.0);
    const double scale = std::min(available / width, available / height);
    const double centerX = (bounds.minX + bounds.maxX) * 0.5;
    const double centerY = (bounds.minY + bounds.maxY) * 0.5;
    const int penWidth = pixels >= 512 ? 2 : 1;
    HPEN pen = CreatePen(PS_SOLID, penWidth, kLineColor);
    const HGDIOBJ oldPen = SelectObject(dc, pen);
    SetBkMode(dc, TRANSPARENT);

    for (const Path& path : scene.paths) {
      if (path.points.size() < 2) continue;
      std::vector<POINT> devicePoints;
      devicePoints.reserve(path.points.size() + (path.closed ? 1u : 0u));
      for (const Point point : path.points) {
        const double x = pixels * 0.5 + (point.x - centerX) * scale;
        const double y = pixels * 0.5 - (point.y - centerY) * scale;
        devicePoints.push_back(POINT{
            static_cast<LONG>(std::lround(std::clamp(x, -32768.0, 32767.0))),
            static_cast<LONG>(std::lround(std::clamp(y, -32768.0, 32767.0))),
        });
      }
      if (path.closed && (devicePoints.front().x != devicePoints.back().x ||
          devicePoints.front().y != devicePoints.back().y)) {
        devicePoints.push_back(devicePoints.front());
      }
      Polyline(dc, devicePoints.data(), static_cast<int>(devicePoints.size()));
    }
    SelectObject(dc, oldPen);
    DeleteObject(pen);
  } else {
    SetBkMode(dc, TRANSPARENT);
    SetTextColor(dc, RGB(112, 38, 38));
    const int fontHeight = -std::max(14, static_cast<int>(pixels / 5));
    HFONT font = CreateFontW(
        fontHeight, 0, 0, 0, FW_SEMIBOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET,
        OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, DEFAULT_PITCH, L"Segoe UI");
    const HGDIOBJ oldFont = SelectObject(dc, font);
    DrawTextW(dc, L"DXF", -1, &canvas, DT_CENTER | DT_VCENTER | DT_SINGLELINE | DT_NOPREFIX);
    SelectObject(dc, oldFont);
    DeleteObject(font);
  }

  SelectObject(dc, oldBitmap);
  DeleteDC(dc);
  return bitmap;
}

}  // namespace

HRESULT RenderDxfThumbnail(
    const std::uint8_t* data,
    std::size_t size,
    UINT requestedPixels,
    HBITMAP* bitmap,
    RenderStats* stats) noexcept {
  if (bitmap == nullptr) return E_POINTER;
  *bitmap = nullptr;
  if (stats != nullptr) *stats = {};
  if (requestedPixels < 16u || requestedPixels > kMaxThumbnailPixels) return E_INVALIDARG;
  try {
    std::vector<Pair> pairs;
    pairs.reserve(std::min(kMaxPairs, size / 8u + 1u));
    HRESULT result = ParsePairs(data, size, &pairs);
    if (FAILED(result)) return result;

    std::vector<Entity> entities;
    std::unordered_map<std::string, Block> blocks;
    std::size_t entityCount = 0;
    result = ParseDocument(pairs, &entities, &blocks, &entityCount);
    if (FAILED(result)) return result;

    Scene scene;
    FlattenEntities(entities, blocks, Matrix{}, 0, &scene);
    if (scene.limitExceeded) return HRESULT_FROM_WIN32(ERROR_FILE_TOO_LARGE);
    HBITMAP rendered = CreateThumbnailBitmap(scene, requestedPixels);
    if (rendered == nullptr) return E_OUTOFMEMORY;
    *bitmap = rendered;
    if (stats != nullptr) {
      stats->entities = entityCount;
      stats->paths = scene.paths.size();
      stats->points = scene.pointCount;
    }
    return S_OK;
  } catch (const std::bad_alloc&) {
    return E_OUTOFMEMORY;
  } catch (...) {
    return E_FAIL;
  }
}

}  // namespace excelsis::thumbnail
