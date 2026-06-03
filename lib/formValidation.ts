"use server";

import { formSchemaLogin, formSchemaRegister } from "./formSchema";

export const formValidationLogin = async (
  prev: unknown,
  formData: FormData,
) => {
  try {
    const data = Object.fromEntries(formData.entries());
    const validation = formSchemaLogin.safeParse(data);

    if (!validation.success) {
      return {
        error: validation.error.flatten().fieldErrors,
        message: "Data tidak valid!",
        status: false,
        data: null,
      };
    }

    const { email, password } = validation.data;

    return {
      error: null,
      status: true,
      message: "Data valid!",
      data: {
        email,
        password,
      },
    };
  } catch {
    return {
      error: null,
      message: "Data tidak valid!",
      status: false,
      data: null,
    };
  }
};

export const formValidationRegister = async (
  prev: unknown,
  formData: FormData,
) => {
  try {
    const data = Object.fromEntries(formData.entries());
    const validation = formSchemaRegister.safeParse(data);

    if (!validation.success) {
      return {
        error: validation.error.flatten().fieldErrors,
        message: "Data tidak valid!",
        status: false,
        data: null,
      };
    }

    const { nama_lengkap, email, password } = validation.data;

    return {
      error: null,
      status: true,
      message: "Data valid!",
      data: {
        nama_lengkap,
        email,
        password,
      },
    };
  } catch {
    return {
      error: null,
      message: "Data tidak valid!",
      status: false,
      data: null,
    };
  }
};
