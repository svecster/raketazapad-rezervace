import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, password } = await req.json()
    
    console.log('Owner bootstrap action:', action)

    if (action === 'check') {
      // Check if owner auth user exists
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error('Error listing users:', listError)
        return new Response(
          JSON.stringify({ success: false, error: 'Chyba při kontrole uživatelů' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const ownerExists = authUsers.users.some(user => user.email === 'admin@club.local')
      
      // Also check public.users table
      const { data: publicUser, error: publicError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', 'admin@club.local')
        .eq('role', 'owner')
        .single()

      const hasPublicUser = !publicError && !!publicUser

      return new Response(
        JSON.stringify({ 
          success: true, 
          authUserExists: ownerExists,
          publicUserExists: hasPublicUser,
          needsSetup: !ownerExists || !hasPublicUser
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'create') {
      // Create owner auth user and public user record
      console.log('Creating owner user...')
      
      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: 'admin@club.local',
        password: 'Admin123!',
        email_confirm: true,
        user_metadata: {
          role: 'owner',
          username: 'admin',
          name: 'Hlavní administrátor'
        }
      })

      if (authError) {
        console.error('Auth user creation error:', authError)
        return new Response(
          JSON.stringify({ success: false, error: `Chyba při vytváření uživatele: ${authError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Create/update public user record
      const { error: publicError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: authData.user.id,
          email: 'admin@club.local',
          username: 'admin',
          name: 'Hlavní administrátor',
          role: 'owner'
        })

      if (publicError) {
        console.error('Public user creation error:', publicError)
        return new Response(
          JSON.stringify({ success: false, error: `Chyba při vytváření uživatelského profilu: ${publicError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'updatePassword') {
      if (!password || password.length < 8) {
        return new Response(
          JSON.stringify({ success: false, error: 'Heslo musí mít alespoň 8 znaků' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      // Find the owner user
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error('Error listing users:', listError)
        return new Response(
          JSON.stringify({ success: false, error: 'Chyba při hledání uživatele' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const ownerUser = authUsers.users.find(user => user.email === 'admin@club.local')
      
      if (!ownerUser) {
        return new Response(
          JSON.stringify({ success: false, error: 'Vlastník nebyl nalezen' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      // Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(ownerUser.id, {
        password
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        return new Response(
          JSON.stringify({ success: false, error: `Chyba při aktualizaci hesla: ${updateError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Neplatná akce' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Owner bootstrap error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Interní chyba serveru' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})