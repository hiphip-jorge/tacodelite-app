import { json } from "@remix-run/server-runtime";
import { createServerClient } from "@supabase/auth-helpers-remix";


export type menuItem = {
  id?: number;
  alt?: string | null;
  img?: string | null;
  active: boolean;
  category: string;
  categoryId: Number | null;
  description: string;
  name: string;
  price: string;
  vegetarian: boolean;
};

export async function  getMenuItems(request:Request) {
    const response = new Response();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        request,
        response,
      });

      const {data, error} = await supabase.from('menu').select('*');

      return json({menu: data?.at(0), error});
}

export async function getMenuItem(id:string, request:Request) {
    const response = new Response();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        request,
        response,
      });

      const {data, error} = await supabase.from('menu').select('*').eq('id', id);

      return json({menuItem: data?.at(0), error});
}

export async function getProfileByName(name:string, request:Request) {
    const response = new Response();
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        request,
        response,
      });

    const {data, error} = await supabase.from('menu').select('*').eq('name', name);

    return json({menuItem: data?.at(0), error});
}

export async function addMenuItem(menuItem:menuItem , request:Request) {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    });

    const {data, error} = await supabase.from('menu').insert(menuItem)

    if (!error) {
      const {data} = await supabase.from('menu_categories').select('food_items').eq('id', menuItem.categoryId);
      const menuCategoryAddAttempt = await supabase.from('menu_categories').update({foodItems: [...data?.at(0)?.food_items, menuItem]}).eq('id', menuItem.categoryId);

      if(menuCategoryAddAttempt.error) {
        console.log('menuCategoryAddAttempt.error', menuCategoryAddAttempt.error);
      }
    }

    return json({data, error});
}

export async function updateMenuItem(menuItem:menuItem , request:Request) {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    });

    const {data, error} = await supabase.from('menu').update(menuItem).eq('id', menuItem.id);

    if (!error) {
      const {data} = await supabase.from('menu_categories').select('food_items').eq('id', menuItem.categoryId);
      const menuCategoryUpdateAttempt = await supabase.from('menu_categories').update({
        food_items: data?.at(0)?.food_items.map((currentItem: menuItem) => {
          if (currentItem.id === menuItem.id) {
            return menuItem;
          } else {
            return currentItem;
          }
        }),
      }).eq('id', menuItem.categoryId);

      console.log('Update Array >> ', data?.at(0)?.food_items.filter((item: menuItem) => item.id !== menuItem.categoryId));

      if(menuCategoryUpdateAttempt.error) {
        console.log('menuCategoryUpdateAttempt.error', menuCategoryUpdateAttempt.error);
      }
    }

    return json({data, error});
}

export async function deleteMenuItem(menuItem:menuItem , request:Request) {
  const response = new Response();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      request,
      response,
    });

    const { error } = await supabase.from('menu').delete().eq('id', menuItem.id);

    if (!error) {
      const {data} = await supabase.from('menu_categories').select('food_items').eq('id', menuItem.categoryId);
    const menuCategoryDeleteAttempt = await supabase
      .from("menu_categories")
      .update({
        food_items: data?.at(0)?.food_items.filter((item: menuItem) => item.id !== menuItem.categoryId),
      })
      .eq("id", menuItem.categoryId);

      if(menuCategoryDeleteAttempt.error) {
        console.log('menuCategoryDeleteAttempt.error', menuCategoryDeleteAttempt.error);
      }
    }

    return json({});
}