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
    const { action, password, email, userData } = await req.json()
    
    console.log('Owner bootstrap action:', action)

    if (action === 'assignOwnerByEmail') {
      // Security check: only allow jsvec.jr@gmail.com
      if (email !== 'jsvec.jr@gmail.com') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Unauthorized email address' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      try {
        // Find the auth user by email
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (authError) {
          console.error('Error listing auth users:', authError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to find user' 
            }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const authUser = authUsers.users.find(user => user.email === email)
        
        if (!authUser) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'User not found' 
            }),
            { 
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Upsert into public.users table with owner role
        const { error: upsertError } = await supabaseAdmin
          .from('users')
          .upsert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Owner',
            role: 'owner'
          }, {
            onConflict: 'id'
          })

        if (upsertError) {
          console.error('Error upserting user:', upsertError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to assign owner role' 
            }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log('Successfully assigned owner role to:', email)
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      } catch (error) {
        console.error('Error in assignOwnerByEmail:', error)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Internal server error' 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

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
      // Create owner auth user and public user record if they don't exist
      console.log('Creating owner user...')
      
      // First check if auth user already exists
      const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error('Error listing users:', listError)
        return new Response(
          JSON.stringify({ success: false, error: 'Chyba při kontrole existujících uživatelů' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const existingAuthUser = authUsers.users.find(user => user.email === 'admin@club.local')
      let authUserId = existingAuthUser?.id

      // Create auth user only if it doesn't exist
      if (!existingAuthUser) {
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

        authUserId = authData.user.id
        console.log('Created auth user with ID:', authUserId)
      } else {
        console.log('Auth user already exists with ID:', authUserId)
      }

      // Check if there's an existing dummy user record and delete it
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', 'admin@club.local')
        .single()

      if (!checkError && existingUser && existingUser.id !== authUserId) {
        console.log('Deleting dummy user record:', existingUser.id)
        const { error: deleteError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', existingUser.id)
        
        if (deleteError) {
          console.error('Error deleting dummy user:', deleteError)
        }
      }

      // Create/update public user record with correct auth user ID
      const { error: publicError } = await supabaseAdmin
        .from('users')
        .upsert({
          id: authUserId,
          email: 'admin@club.local',
          username: 'admin',
          name: 'Hlavní administrátor',
          role: 'owner'
        }, {
          onConflict: 'id'
        })

      if (publicError) {
        console.error('Public user creation error:', publicError)
        return new Response(
          JSON.stringify({ success: false, error: `Chyba při vytváření uživatelského profilu: ${publicError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      console.log('Successfully created/updated owner user')
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

    if (action === 'createStaffUser') {
      try {
        const aliasEmail = `${userData.username}@club.local`;

        // Create auth user with admin privileges
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: aliasEmail,
          password: userData.password,
          email_confirm: true,
          user_metadata: {
            name: userData.name,
            username: userData.username
          }
        });

        if (authError) {
          console.error('Auth user creation error:', authError);
          return new Response(
            JSON.stringify({ success: false, error: authError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (authData.user) {
          // Create user record in public schema
          const { error: userError } = await supabaseAdmin
            .from('users')
            .upsert({
              id: authData.user.id,
              name: userData.name,
              email: aliasEmail,
              username: userData.username,
              phone: userData.phone,
              role: userData.role
            });

          if (userError) {
            console.error('User record creation error:', userError);
            return new Response(
              JSON.stringify({ success: false, error: userError.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        console.log(`Successfully created ${userData.role} user: ${userData.username}`);
        return new Response(
          JSON.stringify({ success: true, aliasEmail }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Error creating staff user:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'resetStaffPassword') {
      try {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userData.userId, {
          password: userData.newPassword
        });

        if (error) {
          console.error('Password reset error:', error);
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Successfully reset password for user: ${userData.userId}`);
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Error resetting staff password:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
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