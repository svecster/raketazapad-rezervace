import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  UserPlus, 
  Search, 
  RotateCcw, 
  UserMinus, 
  Users,
  Eye,
  EyeOff,
  Copy,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OwnerBootstrapService } from '@/services/ownerBootstrap';

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: 'player' | 'staff' | 'owner';
  created_at: string;
}

export const StaffManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const { toast } = useToast();

  const [createForm, setCreateForm] = useState({
    username: '',
    name: '',
    phone: '',
    password: '',
    role: 'staff' as 'staff' | 'owner'
  });

  const [editForm, setEditForm] = useState({
    id: '',
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'staff' as 'staff' | 'owner' | 'player'
  });

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Chyba při načítání uživatelů",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(password);
    setCreateForm(prev => ({ ...prev, password }));
  };

  const handleCreateUser = async () => {
    if (!createForm.username || !createForm.name || !createForm.password) {
      toast({
        title: "Chyba",
        description: "Vyplňte všechna povinná pole",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    const result = await OwnerBootstrapService.createStaffUser({
      username: createForm.username,
      name: createForm.name,
      phone: createForm.phone,
      password: createForm.password,
      role: createForm.role
    });

    if (result.success) {
      toast({
        title: "Uživatel vytvořen",
        description: `${createForm.role === 'staff' ? 'Zaměstnanec' : 'Majitel'} byl úspěšně vytvořen`,
      });
      
      // Show created user info
      setGeneratedPassword(createForm.password);
      setShowPassword(true);
      
      // Reset form and reload users
      setCreateForm({
        username: '',
        name: '',
        phone: '',
        password: '',
        role: 'staff'
      });
      
      loadUsers();
    } else {
      toast({
        title: "Chyba při vytváření uživatele",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsCreating(false);
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    const newPassword = generateTempPassword();
    
    const result = await OwnerBootstrapService.resetStaffPassword(userId, newPassword);
    
    if (result.success) {
      toast({
        title: "Heslo resetováno",
        description: `Nové heslo pro ${userName}: ${newPassword}`,
      });
    } else {
      toast({
        title: "Chyba při resetování hesla",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
      toast({
        title: "Zkopírováno",
        description: "Heslo bylo zkopírováno do schránky",
      });
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditForm({
      id: user.id,
      username: user.username || '',
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
    setShowEditDialog(true);
  };

  const handleEditUser = async () => {
    if (!editForm.name || !editForm.email) {
      toast({
        title: "Chyba",
        description: "Vyplňte všechna povinná pole",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    const result = await OwnerBootstrapService.updateUser({
      id: editForm.id,
      username: editForm.username,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      role: editForm.role
    });

    if (result.success) {
      toast({
        title: "Uživatel upraven",
        description: "Údaje byly úspěšně aktualizovány",
      });
      
      setShowEditDialog(false);
      setEditingUser(null);
      loadUsers();
    } else {
      toast({
        title: "Chyba při úpravě uživatele",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsCreating(false);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Opravdu chcete smazat uživatele ${userName}? Tato akce je nevratná!`)) {
      return;
    }

    const result = await OwnerBootstrapService.deleteUser(userId);
    
    if (result.success) {
      toast({
        title: "Uživatel smazán",
        description: `${userName} byl úspěšně smazán`,
      });
      loadUsers();
    } else {
      toast({
        title: "Chyba při mazání uživatele",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hledat podle jména, emailu nebo uživatelského jména..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="btn-tennis">
              <UserPlus className="mr-2 h-4 w-4" />
              Vytvořit uživatele
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nový zaměstnanec</DialogTitle>
              <DialogDescription>
                Vytvořte nového zaměstnance nebo majitele
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Uživatelské jméno *</Label>
                <Input
                  id="username"
                  placeholder="pokladna"
                  value={createForm.username}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground">
                  Alias email: {createForm.username}@club.local
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Jméno *</Label>
                <Input
                  id="name"
                  placeholder="Jan Novák"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  placeholder="+420 123 456 789"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={createForm.role} onValueChange={(value: 'staff' | 'owner') => setCreateForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Zaměstnanec</SelectItem>
                    <SelectItem value="owner">Majitel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Dočasné heslo *</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Zadejte heslo"
                    value={createForm.password}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    Generovat
                  </Button>
                </div>
                {generatedPassword && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="font-mono text-sm flex-1">
                      {showPassword ? generatedPassword : '••••••••'}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedPassword)}
                    >
                      {copiedPassword ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateUser}
                  disabled={isCreating}
                  className="flex-1 btn-tennis"
                >
                  {isCreating ? "Vytvářím..." : "Vytvořit"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Zrušit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upravit uživatele</DialogTitle>
              <DialogDescription>
                Upravte údaje uživatele {editingUser?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Uživatelské jméno</Label>
                <Input
                  id="edit-username"
                  placeholder="pokladna"
                  value={editForm.username}
                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                />
                {editForm.username && (
                  <p className="text-sm text-muted-foreground">
                    Alias email: {editForm.username}@club.local
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Jméno *</Label>
                <Input
                  id="edit-name"
                  placeholder="Jan Novák"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="jan.novak@email.cz"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefon</Label>
                <Input
                  id="edit-phone"
                  placeholder="+420 123 456 789"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select value={editForm.role} onValueChange={(value: 'staff' | 'owner' | 'player') => setEditForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Hráč</SelectItem>
                    <SelectItem value="staff">Zaměstnanec</SelectItem>
                    <SelectItem value="owner">Majitel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleEditUser}
                  disabled={isCreating}
                  className="flex-1 btn-tennis"
                >
                  {isCreating ? "Ukládám..." : "Uložit změny"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Zrušit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Načítám uživatele...</div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {user.name}
                      {user.username && (
                        <Badge variant="outline" className="text-xs">
                          @{user.username}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {user.email}
                      {user.phone && ` • ${user.phone}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={user.role === 'owner' ? 'default' : user.role === 'staff' ? 'secondary' : 'outline'}
                    >
                      {user.role === 'owner' ? 'Majitel' : user.role === 'staff' ? 'Personál' : 'Hráč'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(user)}
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Upravit
                  </Button>
                  {user.role !== 'player' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResetPassword(user.id, user.name)}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Reset hesla
                    </Button>
                  )}
                  {user.role !== 'owner' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                    >
                      <UserMinus className="mr-1 h-3 w-3" />
                      Smazat
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Žádní uživatelé nenalezeni' : 'Zatím žádní uživatelé'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};