import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useApp } from './store';
import { useAuth } from './auth';
import { Btn, Page, T } from './ui';

export function Login() {
  const { s, t, he } = useApp();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const input = {
    height: 50, borderWidth: 1.5, borderColor: t.ink, borderRadius: 12, paddingHorizontal: 14, color: t.ink,
    fontSize: 16, fontFamily: 'Heebo_400Regular', textAlign: he ? 'right' : 'left',
  } as const;

  const submit = async () => {
    if (busy || !email || !password) return;
    setBusy(true); setMsg(null);
    if (mode === 'in') {
      const err = await signIn(email, password);
      if (err) setMsg(s.badLogin);
    } else {
      const r = await signUp(email, password);
      setMsg(r.error ?? (r.confirm ? s.checkEmail : null));
    }
    setBusy(false);
  };

  return (
    <Page>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 12 }}>
        <T k="head" s={36} lh={1.1}>{mode === 'in' ? s.signIn : s.signUp}</T>
        <T s={14} lh={1.4}>{s.loginNote}</T>
        <TextInput
          value={email} onChangeText={setEmail} placeholder={s.email} placeholderTextColor={t.ink + '88'}
          autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" style={input}
        />
        <TextInput
          value={password} onChangeText={setPassword} placeholder={s.password} placeholderTextColor={t.ink + '88'}
          secureTextEntry autoCapitalize="none" textContentType={mode === 'in' ? 'password' : 'newPassword'}
          onSubmitEditing={submit} style={input}
        />
        {msg && <T s={14} lh={1.4} c={t.accText}>{msg}</T>}
        <Btn onPress={submit} style={{ height: 52, borderRadius: 14, backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
          <T w={700} s={17} c={t.onAcc}>{mode === 'in' ? s.signIn : s.signUp}</T>
        </Btn>
        <Btn onPress={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(null); }} style={{ height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <T w={500} s={15}>{mode === 'in' ? s.toSignUp : s.toSignIn}</T>
        </Btn>
      </View>
    </Page>
  );
}
