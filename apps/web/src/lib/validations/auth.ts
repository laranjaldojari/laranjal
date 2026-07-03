import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  senha: z.string().min(8, 'A senha deve ter ao menos 8 caracteres'),
  mfaToken: z.string().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;
