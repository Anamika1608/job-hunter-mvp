import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const listInput = z.object({
  q: z.string().trim().optional(),
  company: z.string().trim().optional(),
  location: z.string().trim().optional(),
  employmentType: z.string().trim().optional(),
  isRemote: z.boolean().optional(),
  source: z.string().trim().optional(),
  sort: z
    .enum(["postedAtDesc", "postedAtAsc", "titleAsc", "titleDesc"]) 
    .default("postedAtDesc"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
});

export const jobRouter = createTRPCRouter({
  list: publicProcedure.input(listInput).query(async ({ ctx, input }) => {
    const where = {
      AND: [
        input.q
          ? {
              OR: [
                { title: { contains: input.q, mode: "insensitive" } },
                { company: { contains: input.q, mode: "insensitive" } },
                { location: { contains: input.q, mode: "insensitive" } },
                { description: { contains: input.q, mode: "insensitive" } },
              ],
            }
          : undefined,
        input.company
          ? { company: { contains: input.company, mode: "insensitive" } }
          : undefined,
        input.location
          ? { location: { contains: input.location, mode: "insensitive" } }
          : undefined,
        input.employmentType
          ? {
              employmentType: {
                contains: input.employmentType,
                mode: "insensitive",
              },
            }
          : undefined,
        typeof input.isRemote === "boolean" ? { isRemote: input.isRemote } : undefined,
        input.source ? { source: { equals: input.source } } : undefined,
      ].filter(Boolean),
    } as const;

    const orderBy =
      input.sort === "postedAtAsc"
        ? [{ postedAt: "asc" }]
        : input.sort === "titleAsc"
          ? [{ title: "asc" }]
          : input.sort === "titleDesc"
            ? [{ title: "desc" }]
            : [{ postedAt: "desc" }];

    const skip = (input.page - 1) * input.pageSize;
    const [total, jobs] = await Promise.all([
      ctx.db.job.count({ where }),
      ctx.db.job.findMany({
        where,
        orderBy,
        skip,
        take: input.pageSize,
        select: {
          id: true,
          title: true,
          company: true,
          location: true,
          employmentType: true,
          isRemote: true,
          postedAt: true,
          url: true,
          source: true,
          description: true,
        },
      }),
    ]);

    return {
      total,
      page: input.page,
      pageSize: input.pageSize,
      items: jobs,
    };
  }),
});



