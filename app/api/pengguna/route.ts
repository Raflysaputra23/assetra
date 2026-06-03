/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
    try {
        if (!supabaseServiceKey) {
            return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di file .env" }, { status: 500 });
        }
        
        const { email, password, nama_lengkap, role } = await request.json();
        
        const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                nama_lengkap,
                role
            }
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, user: authData.user });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        if (!supabaseServiceKey) {
            return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di file .env" }, { status: 500 });
        }

        const { id, nama_lengkap, role, password } = await request.json();

        const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { error: dbError } = await supabaseAdmin
            .from("users")
            .update({
                nama_lengkap,
                role
            })
            .eq("id", id);

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 400 });
        }

        const updatePayload: Record<string, any> = {
            user_metadata: { nama_lengkap, role }
        };
        
        if (password) {
            updatePayload.password = password;
        }

        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updatePayload);

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        if (!supabaseServiceKey) {
            return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di file .env" }, { status: 500 });
        }

        const { id } = await request.json();

        const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 1. Delete from public.users
        const { error: dbError } = await supabaseAdmin
            .from("users")
            .delete()
            .eq("id", id);

        if (dbError) {
            return NextResponse.json({ error: dbError.message }, { status: 400 });
        }

        // 2. Delete from auth.users
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
