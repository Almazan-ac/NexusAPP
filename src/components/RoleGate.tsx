import React, { useState } from 'react';
import { Mail, Lock, User, Store, Compass, Sparkles, LogIn, ChevronRight, GraduationCap } from 'lucide-react';
import { AppUserRole, UserProfile } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface RoleGateProps {
  onSelectRole: (role: AppUserRole, details?: { age?: number; studiesMarketing?: boolean; name?: string }) => void;
}

export default function RoleGate({ onSelectRole }: RoleGateProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<AppUserRole>('consumer');
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gamertag, setGamertag] = useState('');
  
  // Emprendedor specific details
  const [age, setAge] = useState<number>(26);
  const [studiesMarketing, setStudiesMarketing] = useState<boolean>(true);
  
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorText('Por favor completa todos los campos de credenciales.');
      return;
    }
    
    if (activeTab === 'signup' && !gamertag.trim()) {
      setErrorText('Por favor proporciona un nombre o Gamertag para identificarte.');
      return;
    }
    
    setErrorText('');
    setLoading(true);

    try {
      if (activeTab === 'signup') {
        // Create user in firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;
        const uid = user.uid;

        // Create the Profile document in Firestore
        const cleanTag = gamertag.toUpperCase().trim();
        const userProfile: UserProfile & { role: string; email: string; ownerAge?: number; studiesMarketing?: boolean } = {
          gamertag: cleanTag,
          xp: 150,
          unlockedAchievements: [],
          claimedCoupons: [],
          votedIngredients: {},
          role: selectedRole,
          email: email.trim(),
          ownerAge: selectedRole === 'retailer' ? age : undefined,
          studiesMarketing: selectedRole === 'retailer' ? studiesMarketing : undefined
        };

        // Save doc
        await setDoc(doc(db, 'users', uid), userProfile);
        
        // Pass to App state
        onSelectRole(selectedRole, {
          age,
          studiesMarketing,
          name: cleanTag
        });
      } else {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const uid = userCredential.user.uid;

        // Fetch profile
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const profileData = snap.data();
          const targetRole = selectedRole;
          if (profileData.role !== targetRole) {
            await setDoc(doc(db, 'users', uid), { ...profileData, role: targetRole }, { merge: true });
          }
          onSelectRole(targetRole, {
            age: profileData.ownerAge || age,
            studiesMarketing: profileData.studiesMarketing !== false,
            name: profileData.gamertag || 'Socio'
          });
        } else {
          // Profile didn't exist, create default
          const cleanEmail = email.split('@')[0].toUpperCase();
          const userProfile: UserProfile = {
            gamertag: cleanEmail,
            xp: 150,
            unlockedAchievements: [],
            claimedCoupons: [],
            votedIngredients: {}
          };
          await setDoc(doc(db, 'users', uid), userProfile);
          onSelectRole('consumer', { name: cleanEmail });
        }
      }
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = 'Error al procesar la autenticación.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'Este correo electrónico ya está registrado. Elige iniciar sesión.';
      } else if (err.code === 'auth/wrong-password') {
        friendlyMessage = 'Contraseña incorrecta. Inténtalo de nuevo.';
      } else if (err.code === 'auth/user-not-found') {
        friendlyMessage = 'No existe ninguna cuenta asociada a este correo electrónico.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'La contraseña debe tener al menos 6 caracteres por seguridad.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Formato de correo electrónico inválido.';
      }
      setErrorText(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorText('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const uid = result.user.uid;
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists()) {
        const profileData = snap.data();
        const targetRole = selectedRole;
        if (profileData.role !== targetRole) {
          await setDoc(doc(db, 'users', uid), { ...profileData, role: targetRole }, { merge: true });
        }
        onSelectRole(targetRole, {
          age: profileData.ownerAge || age,
          studiesMarketing: profileData.studiesMarketing !== false,
          name: profileData.gamertag || result.user.displayName || 'GUEST'
        });
      } else {
        // Welcome New User Profile
        const cleanName = (result.user.displayName || result.user.email?.split('@')[0] || 'USUARIO').toUpperCase();
        const userProfile = {
          gamertag: cleanName,
          xp: 150,
          unlockedAchievements: [],
          claimedCoupons: [],
          votedIngredients: {},
          role: selectedRole,
          email: result.user.email || ''
        };
        await setDoc(userDocRef, userProfile);
        onSelectRole(selectedRole, { name: cleanName });
      }
    } catch (err: any) {
      console.error(err);
      setErrorText('El inicio de sesión de Google falló. Intenta con correo/contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestBypass = async () => {
    setErrorText('');
    setLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      const uid = cred.user.uid;
      const cleanTag = `INVITADO_${Math.floor(1000 + Math.random() * 9000)}`;

      const userProfile: UserProfile & { role: string } = {
        gamertag: cleanTag,
        xp: 150,
        unlockedAchievements: [],
        claimedCoupons: [],
        votedIngredients: {},
        role: selectedRole
      };
      await setDoc(doc(db, 'users', uid), userProfile);
      
      onSelectRole(selectedRole, {
        age: selectedRole === 'retailer' ? age : undefined,
        studiesMarketing: selectedRole === 'retailer' ? studiesMarketing : undefined,
        name: cleanTag
      });
    } catch (e) {
      console.error(e);
      onSelectRole(selectedRole, { name: 'INVITADO_LOCAL' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 overflow-y-auto flex items-center justify-center p-4 sm:p-6 text-slate-100 font-sans leading-normal selection:bg-indigo-600 selection:text-white">
      {/* Decorative clean radial gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,#1e293b_0%,transparent_60%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#0f172a_0%,transparent_50%)] pointer-events-none"></div>

      <div className="max-w-xl w-full bg-slate-950/95 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl animate-fadeIn">
        <div className="absolute top-0 right-0 text-[10px] font-mono bg-slate-800 border-l border-b border-slate-700 px-3 py-1.5 rounded-bl-xl text-slate-400 font-bold uppercase tracking-wider">
          Tamaulipas Gastro Hub
        </div>

        <div className="space-y-2 text-center pt-2">
          <span className="text-[10px] font-bold text-indigo-400 tracking-wider block uppercase font-mono">INCUBADORA & RED COMERCIAL</span>
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-white uppercase">
            Acceso a la Plataforma
          </h2>
          <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
            Bienvenido al portal inteligente de gastronomía. Inicia sesión para interactuar con marcas, crear planes de negocio y auditar diseños web.
          </p>
        </div>

        {/* Custom Serious Tabs to Choose Sign In or Register */}
        <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorText('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorText('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'signup'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            Crear Cuenta de Socio
          </button>
        </div>

        {/* Step 1: ALWAYS CHOOSE YOUR OPERATING ROLE FIRST */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-mono">
            Selecciona tu Perfil de Operación:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setSelectedRole('consumer')}
              className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3 select-none ${
                selectedRole === 'consumer'
                  ? 'border-indigo-500 bg-indigo-950/10'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedRole === 'consumer' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white uppercase">Consumidor Crítico</h4>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Quiero probar el menú de Nexus, emitir valoraciones de negocio y canjear cupones de premio.
                </p>
              </div>
            </div>

            <div
              onClick={() => setSelectedRole('retailer')}
              className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3 select-none ${
                selectedRole === 'retailer'
                  ? 'border-indigo-500 bg-indigo-950/10'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedRole === 'retailer' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-indigo-400 uppercase">Emprendedor (22-35 años)</h4>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Quiero crear mi marca desde cero, modelar menús y chatear con ingenieros de soporte.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Credentials Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-3.5">
            {/* Conditional field for Signup: Name/Gamertag */}
            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 block font-mono">Nombre Completo o Gamertag:</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={30}
                    placeholder="E.G. CARLOS ALBERTO, ANA_MKT"
                    value={gamertag}
                    onChange={(e) => setGamertag(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 uppercase focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block font-mono">Correo Electrónico:</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 block font-mono font-medium">Contraseña:</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Ingrese al menos 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* If sign up and retailer (Emprendedor), prompt age and marketing studies */}
            {activeTab === 'signup' && selectedRole === 'retailer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block font-mono">Edad (Target: 22-35 años):</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-center text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 block mb-2 font-mono">¿Estudiaste Mercadotecnia?</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStudiesMarketing(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                        studiesMarketing
                          ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500'
                          : 'bg-slate-900 text-slate-500 border-slate-850'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Sí, MKT
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudiesMarketing(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                        !studiesMarketing
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-900 text-slate-500 border-slate-850'
                      }`}
                    >
                      No / Otro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {errorText && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl font-sans leading-normal">
              ⚠️ {errorText}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide rounded-xl uppercase transition-all shadow-md shadow-indigo-900/30 font-mono flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Validando Seguridad...' : activeTab === 'signup' ? 'Crear mi Cuenta de Socio' : 'Ingresar de forma Segura'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-900"></div>
              <span className="flex-shrink mx-4 text-slate-600 text-[10px] font-mono font-bold uppercase tracking-widest">Otras Vías</span>
              <div className="flex-grow border-t border-slate-900"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png" alt="Google" className="w-4 h-4" />
                Acceder con Google
              </button>

              <button
                type="button"
                onClick={handleGuestBypass}
                disabled={loading}
                className="py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono text-[11px]"
              >
                🔑 Ingresar como Invitado
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
