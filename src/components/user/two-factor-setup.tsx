'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEnable2fa, useVerify2fa } from '@/hooks/use-2fa';

interface TwoFactorSetupProps {
  isEnabled: boolean;
}

export function TwoFactorSetup({ isEnabled }: TwoFactorSetupProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'qr' | 'verify'>('qr');
  const [code, setCode] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);

  const { mutate: enable2fa, data: setupData, isPending: isEnabling } = useEnable2fa();
  const { mutate: verify2fa, isPending: isVerifying, error: verifyError } = useVerify2fa();

  const handleOpen = () => {
    setOpen(true);
    setStep('qr');
    setCode('');
    enable2fa();
  };

  const handleClose = () => {
    setOpen(false);
    setStep('qr');
    setCode('');
  };

  const copySecret = () => {
    if (setupData?.secret) {
      void navigator.clipboard.writeText(setupData.secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const handleVerify = () => {
    verify2fa(code, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  if (isEnabled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
        <ShieldCheck className="w-4 h-4" />
        İki adımlı doğrulama aktif
      </div>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
        2FA&apos;yı Aktifleştir
      </Button>

      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İki Adımlı Doğrulama</DialogTitle>
          </DialogHeader>

          {isEnabling || !setupData ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Hazırlanıyor...
            </div>
          ) : step === 'qr' ? (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                Google Authenticator veya benzeri bir uygulamayla aşağıdaki QR kodu okut.
              </p>

              <div className="flex justify-center p-4 bg-white rounded-md border">
                <QRCodeSVG value={setupData.otpAuthUrl} size={200} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  QR okutamıyorsan bu kodu manuel gir:
                </Label>
                <div className="flex items-center gap-2">
                  <Input value={setupData.secret} readOnly className="text-xs font-mono" />
                  <Button size="icon" variant="outline" onClick={copySecret}>
                    {secretCopied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button className="w-full" onClick={() => setStep('verify')}>
                Devam Et
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <p className="text-sm text-muted-foreground">
                Authenticator uygulamasındaki 6 haneli kodu gir.
              </p>

              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="text-center text-lg tracking-widest font-mono"
                maxLength={6}
              />

              {verifyError && (
                <p className="text-sm text-destructive text-center">
                  Kod hatalı, tekrar dene
                </p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('qr')}>
                  Geri
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleVerify}
                  disabled={code.length !== 6 || isVerifying}
                >
                  {isVerifying ? 'Doğrulanıyor...' : 'Doğrula'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
