#include <stdio.h>

#include "prc_stb_image_config.h"
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

#if !defined(STBI_NO_BMP) || !defined(STBI_NO_GIF) || !defined(STBI_NO_HDR) || \
    !defined(STBI_NO_PIC) || !defined(STBI_NO_PNM) || !defined(STBI_NO_PSD) || \
    !defined(STBI_NO_TGA)
#error "Only the declared PRC JPEG and PNG image formats may be compiled"
#endif

/* Deterministically generated 1x1 RGBA PNG: pixel 12 34 56 78. */
static const unsigned char valid_png[] = {
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9c, 0x63, 0x10, 0x32, 0x09, 0xab,
    0x00, 0x00, 0x02, 0x0d, 0x01, 0x15, 0xa9, 0x7e,
    0xa5, 0xc6, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
    0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
};

static const unsigned char unsupported_gif[] = {
    'G', 'I', 'F', '8', '9', 'a', 1, 0, 1, 0, 0, 0, 0
};

int main(void)
{
    int x = 0;
    int y = 0;
    int channels = 0;
    unsigned char *decoded = stbi_load_from_memory(
        valid_png, (int)sizeof(valid_png), &x, &y, &channels, 4);

    if (decoded == NULL || x != 1 || y != 1 || channels != 4 ||
        decoded[0] != 0x12 || decoded[1] != 0x34 ||
        decoded[2] != 0x56 || decoded[3] != 0x78)
    {
        fprintf(stderr, "PNG hardening regression failed\n");
        stbi_image_free(decoded);
        return 1;
    }
    stbi_image_free(decoded);

    decoded = stbi_load_from_memory(
        unsupported_gif, (int)sizeof(unsupported_gif), &x, &y, &channels, 4);
    if (decoded != NULL)
    {
        fprintf(stderr, "disabled GIF decoder unexpectedly accepted input\n");
        stbi_image_free(decoded);
        return 2;
    }

    puts("nanoPRC stb_image hardening tests passed.");
    return 0;
}
