#pragma once

#include <windows.h>

#include <cstddef>
#include <cstdint>

namespace excelsis::thumbnail {

constexpr std::size_t kMaxInputBytes = 32u * 1024u * 1024u;
constexpr std::size_t kMaxPairs = 250000u;
constexpr std::size_t kMaxEntities = 30000u;
constexpr std::size_t kMaxFlattenWork = 200000u;
constexpr std::size_t kMaxRenderPoints = 200000u;
constexpr UINT kMaxThumbnailPixels = 2048u;

struct RenderStats {
  std::size_t entities = 0;
  std::size_t paths = 0;
  std::size_t points = 0;
};

HRESULT RenderDxfThumbnail(
    const std::uint8_t* data,
    std::size_t size,
    UINT requestedPixels,
    HBITMAP* bitmap,
    RenderStats* stats = nullptr) noexcept;

}  // namespace excelsis::thumbnail
