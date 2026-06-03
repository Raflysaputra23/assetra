"use client"

import { Lock, Mail } from "lucide-react"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { useActionState, useEffect, useState } from "react"
import { formValidationLogin } from "@/lib/formValidation"
import ButtonForm from "./ButtonForm"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"


const FormLogin = () => {
    const { session, signin } = useAuth();
    const [state, formAction] = useActionState(formValidationLogin, null);
    const [alert, setAlert] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState(false);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            if (state) {
                if(state.status && state.data) {
                    const res = await signin(state.data.email, state.data.password);
                    if(res === true) {
                        setMessage("Login berhasil");
                        setStatus(true);
                    } else if (res === "suspend") {
                        setMessage("Akun Anda sedang ditangguhkan/suspend");
                        setStatus(false);
                    } else {
                        setMessage("Login gagal");
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
        <section>

            {alert &&
                <div className={`${status ? 'bg-green-500/15 border-green-500 text-green-500' : 'bg-red-500/15 border-red-500 text-red-500'} p-3 rounded-md border border-l-4 mb-4`}>
                    <p className="text-center text-sm font-semibold">{message}</p>
                </div>
            }

            <form action={formAction} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="si-email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="si-email" name="email" type="email" placeholder="nama@kampus.ac.id"
                            className="pl-9" required />
                    </div>
                    <p className="text-destructive text-xs -mt-1">{state && state?.error?.email}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="si-pwd">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="si-pwd" name="password" type="password" placeholder="••••••••"
                            className="pl-9" required />
                    </div>
                    <p className="text-destructive text-xs -mt-1">{state && state?.error?.password}</p>
                </div>
                <div className="flex justify-end">
                    <Link href="/forgot" className="text-xs underline">Lupa password?</Link>
                </div>
                <ButtonForm>Masuk</ButtonForm>
            </form>
        </section>
    )
}

export default FormLogin
