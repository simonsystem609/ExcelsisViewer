# Local GPL-3.0-or-later LibreDWG build; see ../NOTICE.txt.
cmake_minimum_required(VERSION 3.20)
project(excelsis_dwg_converter C)
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
add_library(redwg STATIC
  src/dwg.c src/common.c src/codepages.c src/bits.c src/logging.c
  src/decode.c src/decode2.c src/decode_r11.c src/decode_r2007.c
  src/reedsolomon.c src/print.c src/free.c src/hash.c src/dynapi.c
  src/classes.c src/dwg_api.c src/objects.c src/geom.c
  src/out_dxf.c src/out_dxfb.c src/out_json.c src/out_geojson.c
  src/encode.c src/encode2.c src/dxfclasses.c src/in_dxf.c src/in_json.c)
target_include_directories(redwg PUBLIC include src)
target_compile_options(redwg PRIVATE -fwrapv -fno-common -fno-delete-null-pointer-checks)
add_executable(dwg2dxf programs/dwg2dxf.c)
target_link_libraries(dwg2dxf PRIVATE redwg iconv m)
target_link_options(dwg2dxf PRIVATE -static-libgcc -Wl,--dynamicbase,--nxcompat,--high-entropy-va)
# Build-only upstream writer for the author-owned fixture; never installed.
add_executable(dxf2dwg programs/dxf2dwg.c)
target_link_libraries(dxf2dwg PRIVATE redwg iconv m)
target_link_options(dxf2dwg PRIVATE -static-libgcc -Wl,--dynamicbase,--nxcompat,--high-entropy-va)
