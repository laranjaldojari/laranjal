'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Landmark, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useAuth } from '@/lib/auth';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  const { entrar } = useAuth();
  const [exigeMfa, setExigeMfa] = useState(false);
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(dados: LoginInput) {
    try {
      await entrar(dados);
    } catch (e) {
      const erro = e as AxiosError<{ erro?: { message?: string } }>;
      const msg = erro.response?.data?.erro?.message ?? 'Não foi possível entrar';
      if (typeof msg === 'string' && msg.toLowerCase().includes('mfa')) {
        setExigeMfa(true);
        toast.info('Informe o código de verificação do seu aplicativo.');
      } else {
        toast.error(msg);
      }
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Painel de identidade (esquerda, em telas largas) */}
      <section className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Landmark className="h-5 w-5" />
          </div>
          <span className="font-semibold">Prefeitura de Laranjal do Jari</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">Uma só plataforma para toda a administração municipal.</h1>
          <p className="mt-4 text-sidebar-foreground/70">
            Acesso único e seguro a todas as secretarias, com auditoria completa de cada operação.
          </p>
        </div>
        <p className="flex items-center gap-2 font-mono text-xs text-sidebar-foreground/50">
          <ShieldCheck className="h-3.5 w-3.5" /> Acesso protegido · LGPD · trilha de auditoria
        </p>
      </section>

      {/* Formulário (direita) */}
      <section className="flex flex-col items-center justify-center px-6 py-12">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Entrar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Use suas credenciais institucionais.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="username" placeholder="nome@laranjaldojari.ap.gov.br" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" autoComplete="current-password" placeholder="••••••••" {...register('senha')} />
              {errors.senha && <p className="text-xs text-destructive">{errors.senha.message}</p>}
            </div>

            {exigeMfa && (
              <div className="space-y-1.5 animate-fade-in">
                <Label htmlFor="mfaToken">Código de verificação (MFA)</Label>
                <Input id="mfaToken" inputMode="numeric" placeholder="000000" className="font-mono tracking-[0.3em]" {...register('mfaToken')} />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
