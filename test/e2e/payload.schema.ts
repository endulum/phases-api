import { z } from 'zod';

export const payloadSchema = z
  .strictObject({
    message: z.string(),
    // a notable message about the success or failure of a response.

    data: z.record(z.any()),
    // where any requested or supplemental data goes.

    fieldErrors: z.record(z.string(), z.string()),
    // where input errors go, if the request had a form submission. example:
    // "fieldErrors": {
    //   "username": "Usernames must be between 2 and 16 characters long.",
    //   "confirmPassword": "Passwords do not match."
    // }

    links: z.record(z.string(), z.string()),
    // where supplemental URLs go; this is prevalent in pagination. example:
    // "links": {
    //   "nextPage": "/cats?after=30&take=10"
    //   "prevPage": "/cats?after=10&take=10"
    // }
  })
  .partial();

export type Payload = z.infer<typeof payloadSchema>;
