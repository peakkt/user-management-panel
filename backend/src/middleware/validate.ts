import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export default function validate(
  schema: ZodSchema,
  property: 'body' | 'params' = 'body',
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      return res
        .status(400)
        .json({ errors: result.error.flatten().fieldErrors });
    }
    req[property] = result.data;
    next();
  };
}
