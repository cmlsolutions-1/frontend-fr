import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { resendValidationEmail } from "@/services/user.service";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/Dialog";

interface ValidateEmailProps {
  open: boolean;
  onClose: () => void;
}

export default function ValidateEmail({ open, onClose }: ValidateEmailProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
        await resendValidationEmail(email);
        setMessage("Correo de validación enviado exitosamente.");
        setEmail(""); 
      } catch (err: any) {
        const backendMsg = err.message || "";
    
        if (backendMsg.includes("ya ha sido validado")) {
          setError(
            "El correo ya ha sido validado, por favor ingresa un correo que aún no esté validado."
          );
        } else {
          setError(
            "No fue posible enviar la validación. Verifica el correo e inténtalo nuevamente."
          );
        }
      } finally {
        setLoading(false);
      }
    };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reenviar validación de email</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@correo.com"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>

            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar validación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
