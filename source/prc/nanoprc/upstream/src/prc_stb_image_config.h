#ifndef PRC_STB_IMAGE_CONFIG_H
#define PRC_STB_IMAGE_CONFIG_H

/* PRC pictures handled by this integration are format-declared JPEG or PNG.
 * Keep stb_image's compiled attack surface aligned with that contract. */
#define STBI_ONLY_JPEG
#define STBI_ONLY_PNG
#define STBI_NO_LINEAR
#define STBI_NO_STDIO

#endif
