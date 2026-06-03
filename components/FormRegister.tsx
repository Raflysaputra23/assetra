"use client"

import { Lock, Mail, User } from "lucide-react"
import { Label } from "./ui/label"
import { TabsContent } from "./ui/tabs"
import { Input } from "./ui/input"
import { useActionState, useEffect, useState } from "react"
import { formValidationRegister } from "@/lib/formValidation"
import ButtonForm from "./ButtonForm"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"


const FormRegister = () => {
    const { session, signup } = useAuth();
    const [state, formAction] = useActionState(formValidationRegister, null);
    const [alert, setAlert] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState(false);
    const router = useRouter();

     useEffect(() => {
            (async () => {
                if (state) {
                    if(state.status && state.data) {
                        const res = await signup(state.data.nama_lengkap, state.data.email, state.data.password, "teknisi");
                        if(res) {
                            setMessage("Register berhasil");
                            setStatus(true);
                        } else {
                            setMessage("Register gagal");
                            setStatus(false);
                        }
                        setAlert(true);
                    } else {
                        setMessage(state.message);
                        setStatus(state.status);
                        setAlert(true);
                    }
    
                    const timeout = setTimeout(() => {
                        setAlert(false);
                        clearTimeout(timeout);
                    }, 2000);
                }
            })()
        }, [state, router]);

    useEffect(() => {
        if (session) {
            router.push("/dashboard");
        }
    }, [session, router]);

    return (
        <TabsContent value="signup">
            {alert &&
                <div className={`${status ? 'bg-green-500/15 border-green-500 text-green-500' : 'bg-red-500/15 border-red-500 text-red-500'} p-3 rounded-md border border-l-4 mb-4`}>
                    <p className="text-center text-sm font-semibold">{message}</p>
                </div>
            }
            <form action={formAction} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="su-name">Nama Lengkap</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="su-name" name="nama_lengkap" placeholder="Budi Santoso" className="pl-9"
                            required />
                        <p className="text-destructive text-xs -mt-1">{state && state?.error?.nama_lengkap}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="su-email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="su-email" type="email" name="email" placeholder="nama@kampus.ac.id" className="pl-9"
                            required />
                        <p className="text-destructive text-xs -mt-1">{state && state?.error?.email}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="su-pwd">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="su-pwd" type="password" name="password" placeholder="Minimal 6 karakter" className="pl-9"
                            required />
                    </div>
                    <p className="text-destructive text-xs -mt-1">{state && state?.error?.password}</p>
                </div>
                <ButtonForm>
                    Buat Akun
                </ButtonForm>
            </form>
        </TabsContent>
    )
}

export default FormRegister
