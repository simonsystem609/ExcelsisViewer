// Copyright 2026 ExcelsisView contributors.
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// This bridge uses the Apache-2.0 Intel U3D sample implementation through
// its documented public interfaces.  It emits the same bounded, renderer-
// neutral scene representation used by ExcelsisView's other 3D decoders.

#define IFX_INIT_GUID

#include "IFXCoreCIDs.h"
#include "IFXCoreServices.h"
#include "IFXImportingCIDs.h"
#include "IFXLoadManager.h"
#include "IFXReadBuffer.h"
#include "IFXStdio.h"
#include "IFXSceneGraph.h"
#include "IFXPalette.h"
#include "IFXNode.h"
#include "IFXModel.h"
#include "IFXAuthorCLODResource.h"
#include "IFXAuthorCLODMesh.h"
#include "IFXCOM.h"
#include "IFXOSUtilities.h"

#include <windows.h>

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <map>
#include <set>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

namespace {

constexpr std::uint32_t kMaximumMeshes = 100000;
constexpr std::uint64_t kMaximumVertices = 50000000;
constexpr std::uint64_t kMaximumTriangles = 100000000;
constexpr std::uint32_t kMaximumTreeDepth = 2048;

struct Mesh {
  std::uint32_t generator_id = 0;
  std::vector<float> positions;
  std::vector<std::uint32_t> indices;
};

struct SceneNode {
  std::string name;
  float matrix[16] = {
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
  };
  bool has_mesh = false;
  std::uint32_t generator_id = 0;
  std::vector<SceneNode> children;
};

class IfxException : public std::runtime_error {
 public:
  IfxException(const char* operation, IFXRESULT result)
      : std::runtime_error(format(operation, result)), result_(result) {}

  IFXRESULT result() const { return result_; }

 private:
  static std::string format(const char* operation, IFXRESULT result) {
    std::ostringstream stream;
    stream << operation << " failed with IFXRESULT 0x"
           << std::hex << std::uppercase
           << static_cast<std::uint32_t>(result);
    return stream.str();
  }

  IFXRESULT result_;
};

void check_ifx(IFXRESULT result, const char* operation) {
  if (IFXFAILURE(result)) throw IfxException(operation, result);
}

std::wstring utf8_to_wide(const char* value) {
  if (!value) return {};
  const int size = MultiByteToWideChar(CP_UTF8, MB_ERR_INVALID_CHARS, value, -1, nullptr, 0);
  if (size <= 0) throw std::runtime_error("Input path is not valid UTF-8.");
  std::wstring output(static_cast<std::size_t>(size), L'\0');
  MultiByteToWideChar(CP_UTF8, MB_ERR_INVALID_CHARS, value, -1, &output[0], size);
  output.pop_back();
  return output;
}

std::string ifx_string_to_utf8(const IFXString& value) {
  U32 length = 0;
  IFXString copy(value);
  if (IFXFAILURE(copy.GetLengthU8(&length))) return {};
  std::vector<U8> bytes(static_cast<std::size_t>(length) + 1, 0);
  if (IFXFAILURE(copy.ConvertToRawU8(bytes.data(), length + 1))) return {};
  return std::string(reinterpret_cast<const char*>(bytes.data()), length);
}

void write_json_string(std::ostream& output, const std::string& value) {
  output.put('"');
  static const char* hex = "0123456789ABCDEF";
  for (unsigned char character : value) {
    switch (character) {
      case '"': output << "\\\""; break;
      case '\\': output << "\\\\"; break;
      case '\b': output << "\\b"; break;
      case '\f': output << "\\f"; break;
      case '\n': output << "\\n"; break;
      case '\r': output << "\\r"; break;
      case '\t': output << "\\t"; break;
      default:
        if (character < 0x20) {
          output << "\\u00" << hex[character >> 4] << hex[character & 0x0F];
        } else {
          output.put(static_cast<char>(character));
        }
    }
  }
  output.put('"');
}

void write_matrix(std::ostream& output, const float* matrix) {
  output << '[';
  output << std::setprecision(std::numeric_limits<float>::max_digits10);
  for (int index = 0; index < 16; ++index) {
    if (index) output << ',';
    if (!std::isfinite(matrix[index])) {
      throw std::runtime_error("U3D node contains a non-finite transform.");
    }
    output << matrix[index];
  }
  output << ']';
}

void write_scene_node(std::ostream& output, const SceneNode& node) {
  output << "{\"name\":";
  write_json_string(output, node.name);
  output << ",\"transform\":{\"matrix\":";
  write_matrix(output, node.matrix);
  output << '}';
  if (node.has_mesh) {
    output << ",\"part\":{\"name\":";
    write_json_string(output, node.name);
    output << ",\"tess_indices\":[" << node.generator_id << "]}";
  }
  output << ",\"children\":[";
  for (std::size_t index = 0; index < node.children.size(); ++index) {
    if (index) output << ',';
    write_scene_node(output, node.children[index]);
  }
  output << "]}";
}

void write_u32(std::ostream& output, std::uint32_t value) {
  char bytes[4] = {
      static_cast<char>(value & 0xFF),
      static_cast<char>((value >> 8) & 0xFF),
      static_cast<char>((value >> 16) & 0xFF),
      static_cast<char>((value >> 24) & 0xFF),
  };
  output.write(bytes, sizeof(bytes));
}

void write_mesh_file(const char* path, const std::vector<Mesh>& meshes) {
  std::ofstream output(path, std::ios::binary | std::ios::trunc);
  if (!output) throw std::runtime_error("Cannot create the U3D mesh output.");
  const char magic[8] = {'U', '3', 'D', 'M', '0', '1', '\0', '\0'};
  output.write(magic, sizeof(magic));
  write_u32(output, 1);
  write_u32(output, static_cast<std::uint32_t>(meshes.size()));
  for (const Mesh& mesh : meshes) {
    write_u32(output, mesh.generator_id);
    write_u32(output, static_cast<std::uint32_t>(mesh.positions.size() / 3));
    write_u32(output, static_cast<std::uint32_t>(mesh.indices.size()));
    write_u32(output, 0);
    output.write(
        reinterpret_cast<const char*>(mesh.positions.data()),
        static_cast<std::streamsize>(mesh.positions.size() * sizeof(float)));
    for (std::uint32_t index : mesh.indices) write_u32(output, index);
  }
  if (!output) throw std::runtime_error("Failed while writing the U3D mesh output.");
}

void write_manifest_file(
    const char* path,
    const std::vector<Mesh>& meshes,
    const SceneNode& root,
    const std::vector<std::string>& warnings) {
  std::ofstream output(path, std::ios::binary | std::ios::trunc);
  if (!output) throw std::runtime_error("Cannot create the U3D manifest output.");
  output << "{\"format\":\"Excelsis U3D bridge 1\","
         << "\"decoder\":\"ECMA-363 / Intel U3D sample implementation 5c141d9f\","
         << "\"mesh_count\":" << meshes.size() << ",\"model_tree\":";
  write_scene_node(output, root);
  output << ",\"warnings\":[";
  for (std::size_t index = 0; index < warnings.size(); ++index) {
    if (index) output << ',';
    write_json_string(output, warnings[index]);
  }
  output << "]}";
  if (!output) throw std::runtime_error("Failed while writing the U3D manifest output.");
}

std::uint32_t parent_slot(IFXNode* child, IFXNode* parent) {
  const U32 count = child->GetNumberOfParents();
  for (U32 index = 0; index < count; ++index) {
    if (child->GetParentNR(index) == parent) return index;
  }
  return 0;
}

std::string node_name(IFXPalette* node_palette, IFXNode* node) {
  IFXUnknown* unknown = nullptr;
  U32 palette_id = 0;
  IFXString name;
  IFXRESULT result = node->QueryInterface(IID_IFXUnknown, reinterpret_cast<void**>(&unknown));
  if (IFXSUCCESS(result)) result = node_palette->FindByResourcePtr(unknown, &palette_id);
  if (IFXSUCCESS(result)) result = node_palette->GetName(palette_id, &name);
  IFXRELEASE(unknown);
  if (IFXFAILURE(result)) return "Component";
  std::string converted = ifx_string_to_utf8(name);
  return converted.empty() ? "World" : converted;
}

SceneNode build_tree(
    IFXPalette* node_palette,
    IFXNode* node,
    IFXNode* parent,
    std::uint32_t depth,
    std::set<IFXNode*>& ancestors) {
  if (depth > kMaximumTreeDepth) throw std::runtime_error("U3D scene tree is too deep.");
  if (!ancestors.insert(node).second) throw std::runtime_error("U3D scene tree contains a cycle.");

  SceneNode output;
  output.name = node_name(node_palette, node);
  const U32 matrix_index = parent ? parent_slot(node, parent) : 0;
  const IFXMatrix4x4& matrix = node->GetMatrix(matrix_index);
  std::copy(matrix.RawConst(), matrix.RawConst() + 16, output.matrix);

  IFXModel* model = nullptr;
  if (IFXSUCCESS(node->QueryInterface(IID_IFXModel, reinterpret_cast<void**>(&model)))) {
    output.has_mesh = true;
    output.generator_id = model->GetResourceIndex();
  }
  IFXRELEASE(model);

  const U32 child_count = node->GetNumberOfChildren();
  output.children.reserve(child_count);
  for (U32 index = 0; index < child_count; ++index) {
    IFXNode* child = node->GetChildNR(index);
    if (!child) continue;
    output.children.push_back(build_tree(
        node_palette,
        child,
        node,
        depth + 1,
        ancestors));
  }

  ancestors.erase(node);
  return output;
}

Mesh extract_clod_mesh(std::uint32_t generator_id, IFXAuthorCLODResource* resource) {
  IFXAuthorCLODMesh* author_mesh = nullptr;
  check_ifx(resource->GetAuthorMesh(author_mesh), "GetAuthorMesh");
  if (!author_mesh) throw std::runtime_error("U3D mesh resource has no author mesh.");

  const U32 final_resolution = author_mesh->GetFinalMaxResolution();
  if (final_resolution) author_mesh->SetResolution(final_resolution);
  const IFXAuthorMeshDesc* description = author_mesh->GetMeshDesc();
  if (!description || !description->NumPositions || !description->NumFaces) {
    IFXRELEASE(author_mesh);
    throw std::runtime_error("U3D mesh resource contains no triangles.");
  }

  check_ifx(author_mesh->Lock(), "IFXAuthorMesh::Lock");
  IFXVector3* positions = nullptr;
  IFXAuthorFace* faces = nullptr;
  IFXRESULT position_result = author_mesh->GetPositions(&positions);
  IFXRESULT face_result = author_mesh->GetPositionFaces(&faces);
  if (IFXFAILURE(position_result) || IFXFAILURE(face_result) || !positions || !faces) {
    author_mesh->Unlock();
    IFXRELEASE(author_mesh);
    check_ifx(IFXFAILURE(position_result) ? position_result : face_result, "Read U3D author mesh");
    throw std::runtime_error("U3D author mesh did not expose positions and faces.");
  }

  Mesh output;
  output.generator_id = generator_id;
  output.positions.reserve(static_cast<std::size_t>(description->NumPositions) * 3);
  const IFXMatrix4x4& resource_transform = resource->GetTransform();
  for (U32 index = 0; index < description->NumPositions; ++index) {
    IFXVector3 transformed;
    resource_transform.TransformVector(positions[index], transformed);
    const float* values = transformed.RawConst();
    if (!std::isfinite(values[0]) || !std::isfinite(values[1]) || !std::isfinite(values[2])) {
      author_mesh->Unlock();
      IFXRELEASE(author_mesh);
      throw std::runtime_error("U3D mesh contains a non-finite vertex.");
    }
    output.positions.push_back(values[0]);
    output.positions.push_back(values[1]);
    output.positions.push_back(values[2]);
  }
  output.indices.reserve(static_cast<std::size_t>(description->NumFaces) * 3);
  for (U32 index = 0; index < description->NumFaces; ++index) {
    for (int corner = 0; corner < 3; ++corner) {
      const U32 vertex_index = faces[index].corner[corner];
      if (vertex_index >= description->NumPositions) {
        author_mesh->Unlock();
        IFXRELEASE(author_mesh);
        throw std::runtime_error("U3D mesh contains an out-of-range triangle index.");
      }
      output.indices.push_back(vertex_index);
    }
  }

  author_mesh->Unlock();
  IFXRELEASE(author_mesh);
  return output;
}

void load_u3d(
    const wchar_t* input_path,
    IFXCoreServices*& core_services,
    IFXSceneGraph*& scene_graph) {
  check_ifx(
      IFXCreateComponent(
          CID_IFXCoreServices,
          IID_IFXCoreServices,
          reinterpret_cast<void**>(&core_services)),
      "Create IFXCoreServices");
  check_ifx(core_services->Initialize(IFXPROFILE_BASE, 1.0), "Initialize IFXCoreServices");
  check_ifx(
      core_services->GetSceneGraph(IID_IFXSceneGraph, reinterpret_cast<void**>(&scene_graph)),
      "Get IFXSceneGraph");

  IFXLoadManager* load_manager = nullptr;
  IFXReadBuffer* read_buffer = nullptr;
  IFXStdio* stdio_buffer = nullptr;
  try {
    check_ifx(
        IFXCreateComponent(
            CID_IFXLoadManager,
            IID_IFXLoadManager,
            reinterpret_cast<void**>(&load_manager)),
        "Create IFXLoadManager");
    check_ifx(load_manager->Initialize(core_services), "Initialize IFXLoadManager");
    check_ifx(
        IFXCreateComponent(
            CID_IFXStdioReadBuffer,
            IID_IFXReadBuffer,
            reinterpret_cast<void**>(&read_buffer)),
        "Create IFXStdioReadBuffer");
    check_ifx(
        read_buffer->QueryInterface(IID_IFXStdio, reinterpret_cast<void**>(&stdio_buffer)),
        "Get IFXStdio interface");
    check_ifx(stdio_buffer->Open(const_cast<IFXCHAR*>(input_path)), "Open U3D input");
    check_ifx(load_manager->Load(read_buffer, TRUE, TRUE), "Decode U3D input");
    check_ifx(stdio_buffer->Close(), "Close U3D input");
  } catch (...) {
    if (stdio_buffer) stdio_buffer->Close();
    IFXRELEASE(stdio_buffer);
    IFXRELEASE(read_buffer);
    IFXRELEASE(load_manager);
    throw;
  }
  IFXRELEASE(stdio_buffer);
  IFXRELEASE(read_buffer);
  IFXRELEASE(load_manager);
}

void export_scene(const char* input, const char* manifest, const char* mesh_path) {
  const std::wstring input_wide = utf8_to_wide(input);
  IFXCoreServices* core_services = nullptr;
  IFXSceneGraph* scene_graph = nullptr;
  IFXPalette* generator_palette = nullptr;
  IFXPalette* node_palette = nullptr;
  IFXNode* world_node = nullptr;
  IFXUnknown* world_unknown = nullptr;

  check_ifx(IFXSetDefaultLocale(), "Set U3D locale");
  check_ifx(IFXCOMInitialize(), "Initialize U3D runtime");
  try {
    load_u3d(input_wide.c_str(), core_services, scene_graph);
    check_ifx(
        scene_graph->GetPalette(IFXSceneGraph::GENERATOR, &generator_palette),
        "Get generator palette");
    check_ifx(
        scene_graph->GetPalette(IFXSceneGraph::NODE, &node_palette),
        "Get node palette");

    std::vector<Mesh> meshes;
    std::vector<std::string> warnings;
    std::uint64_t total_vertices = 0;
    std::uint64_t total_triangles = 0;
    U32 generator_id = 0;
    if (IFXSUCCESS(generator_palette->First(&generator_id))) {
      do {
        if (generator_id == 0) continue;
        IFXAuthorCLODResource* resource = nullptr;
        const IFXRESULT result = generator_palette->GetResourcePtr(
            generator_id,
            IID_IFXAuthorCLODResource,
            reinterpret_cast<void**>(&resource));
        if (IFXSUCCESS(result) && resource) {
          Mesh mesh = extract_clod_mesh(generator_id, resource);
          total_vertices += mesh.positions.size() / 3;
          total_triangles += mesh.indices.size() / 3;
          if (total_vertices > kMaximumVertices || total_triangles > kMaximumTriangles) {
            IFXRELEASE(resource);
            throw std::runtime_error("U3D geometry exceeds the bridge safety limit.");
          }
          meshes.push_back(std::move(mesh));
          IFXRELEASE(resource);
          if (meshes.size() > kMaximumMeshes) {
            throw std::runtime_error("U3D mesh count exceeds the bridge safety limit.");
          }
        } else if (generator_id != 0) {
          IFXString name;
          generator_palette->GetName(generator_id, &name);
          warnings.push_back(
              "Unsupported non-triangle U3D generator: " + ifx_string_to_utf8(name));
        }
      } while (IFXSUCCESS(generator_palette->Next(&generator_id)));
    }
    if (meshes.empty()) throw std::runtime_error("U3D contains no supported triangle meshes.");

    U32 world_id = 0;
    check_ifx(node_palette->First(&world_id), "Find U3D world node");
    check_ifx(node_palette->GetResourcePtr(world_id, &world_unknown), "Get U3D world node");
    check_ifx(
        world_unknown->QueryInterface(IID_IFXNode, reinterpret_cast<void**>(&world_node)),
        "Get IFXNode for U3D world");
    std::set<IFXNode*> ancestors;
    SceneNode root = build_tree(node_palette, world_node, nullptr, 1, ancestors);

    write_mesh_file(mesh_path, meshes);
    write_manifest_file(manifest, meshes, root, warnings);
  } catch (...) {
    IFXRELEASE(world_node);
    IFXRELEASE(world_unknown);
    IFXRELEASE(node_palette);
    IFXRELEASE(generator_palette);
    IFXRELEASE(scene_graph);
    IFXRELEASE(core_services);
    IFXCOMUninitialize();
    throw;
  }

  IFXRELEASE(world_node);
  IFXRELEASE(world_unknown);
  IFXRELEASE(node_palette);
  IFXRELEASE(generator_palette);
  IFXRELEASE(scene_graph);
  IFXRELEASE(core_services);
  check_ifx(IFXCOMUninitialize(), "Uninitialize U3D runtime");
}

}  // namespace

int main(int argc, char** argv) {
  if (argc != 4) {
    std::cerr << "usage: u3d_app_export <input.u3d> <manifest.json> <mesh.bin>\n";
    return 2;
  }
  try {
    export_scene(argv[1], argv[2], argv[3]);
    return 0;
  } catch (const std::exception& error) {
    std::cerr << "u3d_app_export: " << error.what() << '\n';
    return 1;
  }
}
