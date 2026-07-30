/*
 * Isolated nanoPRC evaluation probe.
 * nanoPRC is AGPLv3; see upstream/LICENSE.
 */
#include <prc_api.h>

#include <float.h>
#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct geometry_stats_s
{
    uint64_t vertices;
    uint64_t finite_vertices;
    uint64_t normals;
    uint64_t invalid_normals;
    uint64_t triangles;
    uint64_t degenerate_triangles;
    uint64_t lines;
    uint64_t invalid_indices;
    double min[3];
    double max[3];
} geometry_stats;

static void geometry_stats_init(geometry_stats *stats)
{
    size_t axis;

    memset(stats, 0, sizeof(*stats));
    for (axis = 0; axis < 3; axis++)
    {
        stats->min[axis] = DBL_MAX;
        stats->max[axis] = -DBL_MAX;
    }
}

static void geometry_stats_add_buffer(
    geometry_stats *stats,
    const prc_api_tess_vertex_buffer *buffer)
{
    size_t index;

    for (index = 0; index < buffer->num_vertices; index++)
    {
        const prc_api_vertex *vertex = &buffer->vertices[index];
        size_t axis;
        int finite_position = 1;

        stats->vertices++;
        for (axis = 0; axis < 3; axis++)
        {
            if (!isfinite(vertex->position[axis]))
            {
                finite_position = 0;
                break;
            }
        }
        if (finite_position)
        {
            stats->finite_vertices++;
            for (axis = 0; axis < 3; axis++)
            {
                double value = vertex->position[axis];
                if (value < stats->min[axis])
                {
                    stats->min[axis] = value;
                }
                if (value > stats->max[axis])
                {
                    stats->max[axis] = value;
                }
            }
        }

        if (vertex->normal_set)
        {
            double length_squared =
                (double)vertex->normal[0] * vertex->normal[0] +
                (double)vertex->normal[1] * vertex->normal[1] +
                (double)vertex->normal[2] * vertex->normal[2];
            stats->normals++;
            if (!isfinite(length_squared) ||
                length_squared < 0.9801 ||
                length_squared > 1.0201)
            {
                stats->invalid_normals++;
            }
        }
    }
}

static int triangle_is_degenerate(
    const prc_api_tess_vertex_buffer *buffer,
    uint32_t index0,
    uint32_t index1,
    uint32_t index2)
{
    const float *p0 = buffer->vertices[index0].position;
    const float *p1 = buffer->vertices[index1].position;
    const float *p2 = buffer->vertices[index2].position;
    double edge10[3];
    double edge20[3];
    double cross[3];
    double edge_scale_squared;
    double cross_squared;
    size_t axis;

    for (axis = 0; axis < 3; axis++)
    {
        edge10[axis] = (double)p1[axis] - p0[axis];
        edge20[axis] = (double)p2[axis] - p0[axis];
    }
    cross[0] = edge10[1] * edge20[2] - edge10[2] * edge20[1];
    cross[1] = edge10[2] * edge20[0] - edge10[0] * edge20[2];
    cross[2] = edge10[0] * edge20[1] - edge10[1] * edge20[0];
    cross_squared =
        cross[0] * cross[0] +
        cross[1] * cross[1] +
        cross[2] * cross[2];
    edge_scale_squared =
        edge10[0] * edge10[0] +
        edge10[1] * edge10[1] +
        edge10[2] * edge10[2] +
        edge20[0] * edge20[0] +
        edge20[1] * edge20[1] +
        edge20[2] * edge20[2];

    return !isfinite(cross_squared) ||
           cross_squared <= DBL_EPSILON * edge_scale_squared * edge_scale_squared;
}

static void geometry_stats_add_triangle(
    geometry_stats *stats,
    const prc_api_tess_vertex_buffer *buffer,
    uint32_t index0,
    uint32_t index1,
    uint32_t index2)
{
    stats->triangles++;
    if (index0 >= buffer->num_vertices ||
        index1 >= buffer->num_vertices ||
        index2 >= buffer->num_vertices)
    {
        stats->invalid_indices++;
        return;
    }
    if (triangle_is_degenerate(buffer, index0, index1, index2))
    {
        stats->degenerate_triangles++;
    }
}

static void geometry_stats_add_primitive(
    geometry_stats *stats,
    const prc_api_tess_vertex_buffer *buffer,
    const prc_api_graphic_primitive *primitive)
{
    size_t index;

    switch (primitive->type)
    {
    case PRC_API_TRIANGLES:
        for (index = 0; index + 2 < primitive->num_indices; index += 3)
        {
            geometry_stats_add_triangle(
                stats,
                buffer,
                primitive->indices[index],
                primitive->indices[index + 1],
                primitive->indices[index + 2]);
        }
        break;
    case PRC_API_FAN:
        for (index = 1; index + 1 < primitive->num_indices; index++)
        {
            geometry_stats_add_triangle(
                stats,
                buffer,
                primitive->indices[0],
                primitive->indices[index],
                primitive->indices[index + 1]);
        }
        break;
    case PRC_API_STRIP:
        for (index = 0; index + 2 < primitive->num_indices; index++)
        {
            geometry_stats_add_triangle(
                stats,
                buffer,
                primitive->indices[index],
                primitive->indices[index + 1],
                primitive->indices[index + 2]);
        }
        break;
    case PRC_API_LINE:
        stats->lines += primitive->num_indices / 2;
        break;
    case PRC_API_LINE_STRIP:
        if (primitive->num_indices > 1)
        {
            stats->lines += primitive->num_indices - 1;
        }
        break;
    case PRC_API_LINE_LOOP:
        if (primitive->num_indices > 1)
        {
            stats->lines += primitive->num_indices;
        }
        break;
    default:
        break;
    }
}

static int write_obj_triangle(
    FILE *file,
    uint32_t index0,
    uint32_t index1,
    uint32_t index2)
{
    return fprintf(
               file,
               "f %u %u %u\n",
               index0 + 1,
               index1 + 1,
               index2 + 1) < 0
               ? -1
               : 0;
}

static int dump_compressed_tessellation_obj(
    prc_context *ctx,
    prc_api_data data,
    uint32_t tessellation_index,
    prc_api_tess *tessellation)
{
    char path[256];
    FILE *file;
    size_t vertex_index;
    size_t primitive_index;
    int code;

    if (tessellation->type != PRC_API_TESS_3D_Compressed ||
        tessellation->num_faces == 0)
    {
        fprintf(stderr, "Selected tessellation is not a compressed mesh\n");
        return PRC_API_ERROR_UNSUPPORTED;
    }

    snprintf(
        path,
        sizeof(path),
        "prc/nanoprc/tmp/nano-tess-%u.obj",
        tessellation_index);
    file = fopen(path, "wb");
    if (file == NULL)
    {
        fprintf(stderr, "Unable to create %s\n", path);
        return PRC_API_ERROR_PARSER;
    }

    for (vertex_index = 0;
         vertex_index < tessellation->tess_vertices.num_vertices;
         vertex_index++)
    {
        const float *position =
            tessellation->tess_vertices.vertices[vertex_index].position;
        if (fprintf(
                file,
                "v %.9g %.9g %.9g\n",
                position[0],
                position[1],
                position[2]) < 0)
        {
            fclose(file);
            return PRC_API_ERROR_PARSER;
        }
    }

    for (primitive_index = 0;
         primitive_index <
         tessellation->tess_faces[0].num_graphic_primitives;
         primitive_index++)
    {
        prc_api_graphic_primitive primitive;
        size_t index;

        code = prc_api_get_graphics_primitive(
            ctx,
            data,
            tessellation,
            0,
            primitive_index,
            &primitive);
        if (code < 0)
        {
            fclose(file);
            return code;
        }

        if (primitive.type == PRC_API_TRIANGLES)
        {
            for (index = 0; index + 2 < primitive.num_indices; index += 3)
            {
                if (write_obj_triangle(
                        file,
                        primitive.indices[index],
                        primitive.indices[index + 1],
                        primitive.indices[index + 2]) < 0)
                {
                    fclose(file);
                    return PRC_API_ERROR_PARSER;
                }
            }
        }
        else if (primitive.type == PRC_API_FAN)
        {
            for (index = 1; index + 1 < primitive.num_indices; index++)
            {
                if (write_obj_triangle(
                        file,
                        primitive.indices[0],
                        primitive.indices[index],
                        primitive.indices[index + 1]) < 0)
                {
                    fclose(file);
                    return PRC_API_ERROR_PARSER;
                }
            }
        }
        else if (primitive.type == PRC_API_STRIP)
        {
            for (index = 0; index + 2 < primitive.num_indices; index++)
            {
                if (write_obj_triangle(
                        file,
                        primitive.indices[index],
                        primitive.indices[index + 1],
                        primitive.indices[index + 2]) < 0)
                {
                    fclose(file);
                    return PRC_API_ERROR_PARSER;
                }
            }
        }
    }

    if (fclose(file) != 0)
        return PRC_API_ERROR_PARSER;
    printf("obj=%s\n", path);
    return 0;
}

static void geometry_stats_merge(geometry_stats *target, const geometry_stats *source)
{
    size_t axis;

    target->vertices += source->vertices;
    target->finite_vertices += source->finite_vertices;
    target->normals += source->normals;
    target->invalid_normals += source->invalid_normals;
    target->triangles += source->triangles;
    target->degenerate_triangles += source->degenerate_triangles;
    target->lines += source->lines;
    target->invalid_indices += source->invalid_indices;
    if (source->finite_vertices == 0)
    {
        return;
    }
    for (axis = 0; axis < 3; axis++)
    {
        if (source->min[axis] < target->min[axis])
        {
            target->min[axis] = source->min[axis];
        }
        if (source->max[axis] > target->max[axis])
        {
            target->max[axis] = source->max[axis];
        }
    }
}

static void geometry_stats_print(
    const char *prefix,
    uint32_t tessellation_index,
    prc_api_tess_type_t type,
    size_t num_faces,
    const geometry_stats *stats)
{
    printf(
        "%s%u type=%u faces=%zu vertices=%llu finite=%llu "
        "triangles=%llu degenerate=%llu lines=%llu bad_indices=%llu "
        "normals=%llu bad_normals=%llu",
        prefix,
        tessellation_index,
        (unsigned int)type,
        num_faces,
        (unsigned long long)stats->vertices,
        (unsigned long long)stats->finite_vertices,
        (unsigned long long)stats->triangles,
        (unsigned long long)stats->degenerate_triangles,
        (unsigned long long)stats->lines,
        (unsigned long long)stats->invalid_indices,
        (unsigned long long)stats->normals,
        (unsigned long long)stats->invalid_normals);
    if (stats->finite_vertices > 0)
    {
        printf(
            " bbox=[%.9g,%.9g,%.9g]-[%.9g,%.9g,%.9g]",
            stats->min[0],
            stats->min[1],
            stats->min[2],
            stats->max[0],
            stats->max[1],
            stats->max[2]);
    }
    printf("\n");
}

static int audit_geometry(
    prc_context *ctx,
    prc_api_data data,
    prc_api_product *model_tree,
    uint32_t num_tessellations,
    uint32_t detail_limit,
    int64_t selected_tessellation,
    prc_api_tess **tessellations_out)
{
    prc_api_tess *tessellations;
    geometry_stats total;
    uint32_t tessellation_index;
    uint8_t has_lines = 0;

    tessellations = (prc_api_tess *)calloc(
        num_tessellations, sizeof(prc_api_tess));
    if (tessellations == NULL && num_tessellations != 0)
    {
        return PRC_API_ERROR_MEMORY;
    }
    *tessellations_out = tessellations;
    geometry_stats_init(&total);

    for (tessellation_index = 0;
         tessellation_index < num_tessellations;
         tessellation_index++)
    {
        prc_api_tess *tessellation = &tessellations[tessellation_index];
        geometry_stats current;
        uint32_t face_index;
        int code;

        if (selected_tessellation >= 0 &&
            tessellation_index != (uint32_t)selected_tessellation)
        {
            continue;
        }

        if (detail_limit > 0)
        {
            printf("audit_begin=%u\n", tessellation_index);
            fflush(stdout);
        }

        tessellation->num_faces = prc_api_get_number_faces(
            ctx, data, tessellation_index);
        if (tessellation->num_faces > 0)
        {
            tessellation->tess_faces = (prc_api_face *)calloc(
                tessellation->num_faces, sizeof(prc_api_face));
            if (tessellation->tess_faces == NULL)
            {
                return PRC_API_ERROR_MEMORY;
            }
        }

        code = prc_api_initialize_tessellation(
            ctx,
            data,
            model_tree,
            tessellation_index,
            tessellation,
            NULL,
            &has_lines);
        if (code < 0)
        {
            return code;
        }

        if (tessellation->type == PRC_API_TESS_3D_Wire ||
            tessellation->type == PRC_API_TESS_MarkUp)
        {
            code = prc_api_get_tessellation_vertices(
                ctx,
                data,
                model_tree,
                tessellation_index,
                0,
                NULL,
                tessellation);
            if (code < 0)
            {
                return code;
            }
        }
        else
        {
            for (face_index = 0;
                 face_index < tessellation->num_faces;
                 face_index++)
            {
                code = prc_api_get_tessellation_vertices(
                    ctx,
                    data,
                    model_tree,
                    tessellation_index,
                    face_index,
                    &tessellation->tess_faces[face_index],
                    tessellation);
                if (code < 0)
                {
                    return code;
                }
            }
        }

        geometry_stats_init(&current);
        if (tessellation->type == PRC_API_TESS_3D_Compressed ||
            tessellation->type == PRC_API_TESS_3D_Wire ||
            tessellation->type == PRC_API_TESS_MarkUp)
        {
            geometry_stats_add_buffer(&current, &tessellation->tess_vertices);
        }
        else
        {
            for (face_index = 0;
                 face_index < tessellation->num_faces;
                 face_index++)
            {
                geometry_stats_add_buffer(
                    &current,
                    &tessellation->tess_faces[face_index].face_vertices);
            }
        }

        for (face_index = 0;
             face_index < (tessellation->type == PRC_API_TESS_3D_Compressed
                               ? (tessellation->num_faces > 0 ? 1U : 0U)
                               : tessellation->num_faces);
             face_index++)
        {
            const prc_api_tess_vertex_buffer *buffer;
            size_t primitive_index;

            buffer = tessellation->type == PRC_API_TESS_3D_Compressed
                         ? &tessellation->tess_vertices
                         : &tessellation->tess_faces[face_index].face_vertices;
            for (primitive_index = 0;
                 primitive_index <
                 tessellation->tess_faces[face_index].num_graphic_primitives;
                 primitive_index++)
            {
                prc_api_graphic_primitive primitive;
                code = prc_api_get_graphics_primitive(
                    ctx,
                    data,
                    tessellation,
                    face_index,
                    primitive_index,
                    &primitive);
                if (code < 0)
                {
                    return code;
                }
                geometry_stats_add_primitive(&current, buffer, &primitive);
            }
        }

        geometry_stats_merge(&total, &current);
        if (selected_tessellation >= 0 || tessellation_index < detail_limit)
        {
            geometry_stats_print(
                "tess=",
                tessellation_index,
                tessellation->type,
                tessellation->num_faces,
                &current);
            printf(
                "tess_source=%u source_index=%d part=%d product=%d\n",
                tessellation_index,
                tessellation->tess_index,
                tessellation->part_index,
                tessellation->product_index);
        }
    }

    geometry_stats_print(
        "geometry_total=",
        num_tessellations,
        PRC_API_TESS_UNKNOWN,
        0,
        &total);
    return 0;
}

int main(int argc, char **argv)
{
    prc_context *ctx;
    prc_api_data data;
    prc_api_product *model_tree = NULL;
    uint32_t num_parts = 0;
    uint32_t num_products = 0;
    uint32_t num_markups = 0;
    uint32_t num_tessellations = 0;
    uint32_t num_line_tessellations = 0;
    prc_api_tess *tessellations = NULL;
    int audit = 0;
    int dump_obj = 0;
    uint32_t detail_limit = 0;
    int64_t selected_tessellation = -1;
    int code;

    if (argc < 2 || argc > 3)
    {
        fprintf(
            stderr,
            "Usage: nano_prc_probe <input.pdf-or-prc> "
            "[--audit|--audit-details|--audit-first=N|--audit-tess=N|"
            "--obj-tess=N]\n");
        return 64;
    }
    if (argc == 3)
    {
        audit = strcmp(argv[2], "--audit") == 0 ||
                strcmp(argv[2], "--audit-details") == 0 ||
                strncmp(argv[2], "--audit-first=", 14) == 0 ||
                strncmp(argv[2], "--audit-tess=", 13) == 0 ||
                strncmp(argv[2], "--obj-tess=", 11) == 0;
        if (strcmp(argv[2], "--audit-details") == 0)
        {
            detail_limit = UINT32_MAX;
        }
        else if (strncmp(argv[2], "--audit-first=", 14) == 0)
        {
            char *end = NULL;
            unsigned long value = strtoul(argv[2] + 14, &end, 10);
            if (end == argv[2] + 14 || *end != '\0' || value > UINT32_MAX)
            {
                audit = 0;
            }
            else
            {
                detail_limit = (uint32_t)value;
            }
        }
        else if (strncmp(argv[2], "--audit-tess=", 13) == 0)
        {
            char *end = NULL;
            unsigned long value = strtoul(argv[2] + 13, &end, 10);
            if (end == argv[2] + 13 || *end != '\0' ||
                value > UINT32_MAX)
            {
                audit = 0;
            }
            else
            {
                selected_tessellation = (int64_t)value;
            }
        }
        else if (strncmp(argv[2], "--obj-tess=", 11) == 0)
        {
            char *end = NULL;
            unsigned long value = strtoul(argv[2] + 11, &end, 10);
            if (end == argv[2] + 11 || *end != '\0' ||
                value > UINT32_MAX)
            {
                audit = 0;
            }
            else
            {
                selected_tessellation = (int64_t)value;
                dump_obj = 1;
            }
        }
        if (!audit)
        {
            fprintf(stderr, "Unknown option: %s\n", argv[2]);
            return 64;
        }
    }

    ctx = prc_api_new_context(NULL);
    if (ctx == NULL)
    {
        fprintf(stderr, "prc_api_new_context failed\n");
        return 70;
    }

    data = prc_api_open_contents(ctx, argv[1]);
    if (data == NULL)
    {
        fprintf(stderr, "prc_api_open_contents failed for %s\n", argv[1]);
        prc_api_print_error_stack(ctx);
        prc_api_release_context(ctx);
        return 2;
    }

    code = prc_api_prep_model_tree(
        ctx, data, &num_parts, &num_products, &num_markups);
    if (code < 0)
    {
        fprintf(stderr, "prc_api_prep_model_tree failed: %d\n", code);
        prc_api_print_error_stack(ctx);
        prc_api_release_data(ctx, data, NULL, 0, NULL, 0, NULL);
        prc_api_release_context(ctx);
        return 3;
    }

    code = prc_api_create_model_tree(
        ctx, data, &model_tree, num_parts, num_products, num_markups);
    if (code < 0)
    {
        fprintf(stderr, "prc_api_create_model_tree failed: %d\n", code);
        prc_api_print_error_stack(ctx);
        prc_api_release_data(ctx, data, NULL, 0, NULL, 0, NULL);
        prc_api_release_context(ctx);
        return 4;
    }

    code = prc_api_get_number_tessellations(
        ctx,
        data,
        model_tree,
        &num_tessellations,
        &num_line_tessellations);
    if (code < 0)
    {
        fprintf(stderr, "prc_api_get_number_tessellations failed: %d\n", code);
        prc_api_print_error_stack(ctx);
        prc_api_release_data(ctx, data, NULL, 0, NULL, 0, model_tree);
        prc_api_release_context(ctx);
        return 5;
    }

    printf(
        "ok parts=%u products=%u markups=%u tessellations=%u line_tessellations=%u\n",
        num_parts,
        num_products,
        num_markups,
        num_tessellations,
        num_line_tessellations);

    if (audit)
    {
        if (selected_tessellation >= (int64_t)num_tessellations)
        {
            fprintf(
                stderr,
                "Tessellation index %lld is out of range (count %u)\n",
                (long long)selected_tessellation,
                num_tessellations);
            prc_api_release_data(ctx, data, NULL, 0, NULL, 0, model_tree);
            prc_api_release_context(ctx);
            return 64;
        }
        code = audit_geometry(
            ctx,
            data,
            model_tree,
            num_tessellations,
            detail_limit,
            selected_tessellation,
            &tessellations);
        if (code < 0)
        {
            fprintf(stderr, "geometry audit failed: %d\n", code);
            prc_api_print_error_stack(ctx);
            prc_api_release_data(
                ctx,
                data,
                tessellations,
                num_tessellations,
                NULL,
                0,
                model_tree);
            prc_api_release_context(ctx);
            return 6;
        }
        if (dump_obj)
        {
            code = dump_compressed_tessellation_obj(
                ctx,
                data,
                (uint32_t)selected_tessellation,
                &tessellations[selected_tessellation]);
            if (code < 0)
            {
                fprintf(stderr, "OBJ export failed: %d\n", code);
                prc_api_print_error_stack(ctx);
                prc_api_release_data(
                    ctx,
                    data,
                    tessellations,
                    num_tessellations,
                    NULL,
                    0,
                    model_tree);
                prc_api_release_context(ctx);
                return 7;
            }
        }
    }

    prc_api_release_data(
        ctx,
        data,
        tessellations,
        tessellations == NULL ? 0 : num_tessellations,
        NULL,
        0,
        model_tree);
    code = prc_api_release_context(ctx);
    if (code != 0)
    {
        fprintf(stderr, "prc_api_release_context failed: %d\n", code);
        return 7;
    }
    return 0;
}
