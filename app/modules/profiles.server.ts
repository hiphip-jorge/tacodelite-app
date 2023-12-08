import { json } from "@remix-run/server-runtime";
import { createServerClient } from "@supabase/auth-helpers-remix"

export type Profile = {id:string, create_at:Date, last_update:Date, admin:Boolean, nickname: string }

export async function  getProfiles(request:Request) {
    const response = new Response();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        request,
        response,
      });

      const {data, error} = await supabase.from('profiles').select('*');

      return json({profiles: data?.at(0), error});
}

export async function getProfileById(id:string, request:Request) {
    const response = new Response();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        request,
        response,
      });

      const {data, error} = await supabase.from('profiles').select('*').eq('id', id);

      return json({profile: data?.at(0), error});
}

export async function getProfileByEmail(email:string, request:Request) {
    const response = new Response();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        request,
        response,
      });

      const {data, error} = await supabase.from('profiles').select('*').eq('email', email);

      return json({profile: data?.at(0), error});
}

export async function isProfileSignedIn(request:Request) {
    const response = new Response();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        request,
        response,
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();
    
      return session?.user ? true : false
}

export async function isAdminProfile(request:Request) {
    const response = new Response();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        request,
        response,
      });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user.id) return {isAdmin: false, error: "Invalid user session."};

      const user = await supabase.from('profiles').select('admin').eq('id', session.user.id);

      return json({isAdmin: user.data?.at(0)?.admin, error: user.error});
}

export async function  addProfile(newProfile:Profile , request:Request) {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    });

    const {data, error} = await supabase.from('profiles').insert(newProfile);

    return json({data, error});
}

export async function  deleteProfile(id:string , request:Request) {
  let res;
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user.id) res = {deletedProfile: null, deletedProfileError: "Invalid user session."};

    const user = await supabase.from('profiles').select('admin').eq('id', session?.user.id);

    if (user.data?.at(0)?.admin) {
      const {data, error} = await supabase.from('profiles').delete().eq('id', id);
      return  json({data, error});
    } else {
      return  json({data: null, error: "User is not an admin."});
    }
}

// updateProfile? should this be allowed