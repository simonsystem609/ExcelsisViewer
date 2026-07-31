//***************************************************************************
//
//  Copyright (c) 2026 ExcelsisView contributors
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//
//***************************************************************************

#ifndef IFXImageSizeUtils_h
#define IFXImageSizeUtils_h

#include "IFXMemory.h"

static const U32 IFX_U3D_IMAGE_MAX_WIDTH = 32768U;
static const U32 IFX_U3D_IMAGE_MAX_HEIGHT = 32768U;
static const U32 IFX_U3D_IMAGE_MAX_COMPONENTS = 4U;
static const U32 IFX_U3D_IMAGE_MAX_PITCH = 131072U;
static const size_t IFX_U3D_IMAGE_MAX_DECODED_BYTES =
	(size_t)256U * (size_t)1024U * (size_t)1024U;

IFXINLINE BOOL IFXIsSupportedImageComponentCount(U32 componentCount)
{
	return componentCount >= 1U &&
		componentCount <= IFX_U3D_IMAGE_MAX_COMPONENTS;
}

IFXINLINE IFXRESULT IFXCheckedMultiplySize(
	size_t left,
	size_t right,
	size_t* pProduct)
{
	if (NULL == pProduct)
		return IFX_E_INVALID_POINTER;

	*pProduct = 0;
	if (0 == left || 0 == right)
		return IFX_E_INVALID_RANGE;

	const size_t maxSize = (size_t)-1;
	if (left > maxSize / right)
		return IFX_E_INVALID_RANGE;

	*pProduct = left * right;
	return IFX_OK;
}

IFXINLINE IFXRESULT IFXCheckedImageByteCount(
	U32 width,
	U32 height,
	U32 componentCount,
	size_t* pByteCount)
{
	if (NULL == pByteCount)
		return IFX_E_INVALID_POINTER;

	*pByteCount = 0;
	if (0 == width || 0 == height ||
		width > IFX_U3D_IMAGE_MAX_WIDTH ||
		height > IFX_U3D_IMAGE_MAX_HEIGHT ||
		componentCount > IFX_U3D_IMAGE_MAX_COMPONENTS ||
		!IFXIsSupportedImageComponentCount(componentCount))
	{
		return IFX_E_INVALID_RANGE;
	}

	size_t pixelCount = 0;
	IFXRESULT result = IFXCheckedMultiplySize(
		(size_t)width,
		(size_t)height,
		&pixelCount);
	if (IFXFAILURE(result))
		return result;

	result = IFXCheckedMultiplySize(
		pixelCount,
		(size_t)componentCount,
		pByteCount);
	if (IFXFAILURE(result))
		return result;

	if (*pByteCount > IFX_U3D_IMAGE_MAX_DECODED_BYTES)
	{
		*pByteCount = 0;
		return IFX_E_INVALID_RANGE;
	}

	return IFX_OK;
}

IFXINLINE IFXRESULT IFXCheckedImagePitchByteCount(
	U32 width,
	U32 height,
	U32 componentCount,
	U32 pitch,
	size_t* pTightRowBytes,
	size_t* pByteCount)
{
	if (NULL == pTightRowBytes || NULL == pByteCount)
		return IFX_E_INVALID_POINTER;

	*pTightRowBytes = 0;
	*pByteCount = 0;

	size_t tightImageBytes = 0;
	IFXRESULT result = IFXCheckedImageByteCount(
		width,
		height,
		componentCount,
		&tightImageBytes);
	if (IFXFAILURE(result))
		return result;

	result = IFXCheckedMultiplySize(
		(size_t)width,
		(size_t)componentCount,
		pTightRowBytes);
	if (IFXFAILURE(result))
		return result;

	if (0 == pitch ||
		pitch > IFX_U3D_IMAGE_MAX_PITCH ||
		(size_t)pitch < *pTightRowBytes)
	{
		*pTightRowBytes = 0;
		return IFX_E_INVALID_RANGE;
	}

	result = IFXCheckedMultiplySize(
		(size_t)height,
		(size_t)pitch,
		pByteCount);
	if (IFXFAILURE(result))
	{
		*pTightRowBytes = 0;
		return result;
	}

	if (*pByteCount > IFX_U3D_IMAGE_MAX_DECODED_BYTES)
	{
		*pTightRowBytes = 0;
		*pByteCount = 0;
		return IFX_E_INVALID_RANGE;
	}

	return IFX_OK;
}

IFXINLINE IFXRESULT IFXAllocateCheckedImageBytes(
	size_t byteCount,
	IFXAllocateFunction* pAllocateFunction,
	void** ppBuffer)
{
	if (NULL == pAllocateFunction || NULL == ppBuffer)
		return IFX_E_INVALID_POINTER;

	*ppBuffer = NULL;
	if (0 == byteCount || byteCount > IFX_U3D_IMAGE_MAX_DECODED_BYTES)
		return IFX_E_INVALID_RANGE;

	*ppBuffer = pAllocateFunction(byteCount);
	return NULL != *ppBuffer ? IFX_OK : IFX_E_OUT_OF_MEMORY;
}

IFXINLINE IFXRESULT IFXReallocateCheckedImageBytes(
	void* pCurrentBuffer,
	size_t byteCount,
	IFXReallocateFunction* pReallocateFunction,
	void** ppBuffer)
{
	if (NULL == pReallocateFunction || NULL == ppBuffer)
		return IFX_E_INVALID_POINTER;

	*ppBuffer = NULL;
	if (0 == byteCount || byteCount > IFX_U3D_IMAGE_MAX_DECODED_BYTES)
		return IFX_E_INVALID_RANGE;

	*ppBuffer = pReallocateFunction(pCurrentBuffer, byteCount);
	return NULL != *ppBuffer ? IFX_OK : IFX_E_OUT_OF_MEMORY;
}

#endif
