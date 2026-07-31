#include "IFXImageSizeUtils.h"

#include <assert.h>
#include <stdlib.h>

static void* TestAllocate(size_t byteCount)
{
	return malloc(byteCount);
}

static void* TestReallocate(void* pMemory, size_t byteCount)
{
	return realloc(pMemory, byteCount);
}

static void* FailAllocate(size_t)
{
	return NULL;
}

static void* FailReallocate(void*, size_t)
{
	return NULL;
}

int main()
{
	size_t byteCount = 123;
	size_t rowBytes = 123;

	assert(IFX_E_INVALID_POINTER ==
		IFXCheckedMultiplySize(1, 1, NULL));
	assert(IFX_E_INVALID_RANGE ==
		IFXCheckedMultiplySize(0, 1, &byteCount));
	assert(IFX_E_INVALID_RANGE ==
		IFXCheckedMultiplySize((size_t)-1, 2, &byteCount));
	assert(IFX_OK ==
		IFXCheckedMultiplySize(1, 1, &byteCount));
	assert(1 == byteCount);

	assert(IFX_E_INVALID_RANGE ==
		IFXCheckedImageByteCount(0, 1, 1, &byteCount));
	assert(IFX_E_INVALID_RANGE ==
		IFXCheckedImageByteCount(1, 0, 1, &byteCount));
	assert(IFX_OK ==
		IFXCheckedImageByteCount(1, 1, 1, &byteCount));
	assert(1 == byteCount);

	assert(IFX_OK ==
		IFXCheckedImageByteCount(
			IFX_U3D_IMAGE_MAX_WIDTH,
			1,
			IFX_U3D_IMAGE_MAX_COMPONENTS,
			&byteCount));
	assert((size_t)IFX_U3D_IMAGE_MAX_PITCH == byteCount);
	assert(IFX_E_INVALID_RANGE ==
		IFXCheckedImageByteCount(
			IFX_U3D_IMAGE_MAX_WIDTH + 1,
			1,
			1,
			&byteCount));
	assert(IFX_E_INVALID_RANGE ==
		IFXCheckedImageByteCount(U32_MAX, U32_MAX, 4, &byteCount));

	assert(IFX_OK ==
		IFXCheckedImageByteCount(8192, 8192, 4, &byteCount));
	assert(IFX_U3D_IMAGE_MAX_DECODED_BYTES == byteCount);
	assert(IFX_E_INVALID_RANGE ==
		IFXCheckedImageByteCount(8192, 8193, 4, &byteCount));
	assert(IFX_OK ==
		IFXCheckedImageByteCount(16, 16, 2, &byteCount));
	assert(512 == byteCount);
	assert(IFX_E_INVALID_RANGE ==
		IFXCheckedImageByteCount(16, 16, 5, &byteCount));

	assert(IFX_E_INVALID_RANGE ==
		IFXCheckedImagePitchByteCount(
			10, 2, 4, 39, &rowBytes, &byteCount));
	assert(IFX_OK ==
		IFXCheckedImagePitchByteCount(
			10, 2, 4, 40, &rowBytes, &byteCount));
	assert(40 == rowBytes);
	assert(80 == byteCount);
	assert(IFX_E_INVALID_RANGE ==
		IFXCheckedImagePitchByteCount(
			IFX_U3D_IMAGE_MAX_WIDTH,
			1,
			4,
			IFX_U3D_IMAGE_MAX_PITCH + 1,
			&rowBytes,
			&byteCount));

	size_t verticalFirstBytes = 0;
	size_t horizontalFirstBytes = 0;
	assert(IFX_OK ==
		IFXCheckedImageByteCount(100, 200, 4, &verticalFirstBytes));
	assert(IFX_OK ==
		IFXCheckedImageByteCount(200, 100, 4, &horizontalFirstBytes));
	assert(verticalFirstBytes == horizontalFirstBytes);

	void* pBuffer = NULL;
	assert(IFX_E_INVALID_POINTER ==
		IFXAllocateCheckedImageBytes(1, TestAllocate, NULL));
	assert(IFX_E_INVALID_RANGE ==
		IFXAllocateCheckedImageBytes(0, TestAllocate, &pBuffer));
	assert(IFX_E_OUT_OF_MEMORY ==
		IFXAllocateCheckedImageBytes(64, FailAllocate, &pBuffer));
	assert(NULL == pBuffer);
	assert(IFX_OK ==
		IFXAllocateCheckedImageBytes(64, TestAllocate, &pBuffer));
	assert(NULL != pBuffer);

	void* pReallocated = NULL;
	assert(IFX_E_OUT_OF_MEMORY ==
		IFXReallocateCheckedImageBytes(
			pBuffer,
			128,
			FailReallocate,
			&pReallocated));
	assert(NULL == pReallocated);
	assert(IFX_OK ==
		IFXReallocateCheckedImageBytes(
			pBuffer,
			128,
			TestReallocate,
			&pReallocated));
	assert(NULL != pReallocated);
	free(pReallocated);

	return 0;
}
