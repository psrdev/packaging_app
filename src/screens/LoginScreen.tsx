import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Text, TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import * as zod from 'zod';
import { useAuth } from '../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Zod Login Validation Schema
const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFields = zod.infer<typeof loginSchema>;

// Custom lightweight resolver to eliminate @hook-form/resolvers dependency issues
const customZodResolver = (schema: typeof loginSchema) => (values: LoginFields) => {
  const result = schema.safeParse(values);
  if (!result.success) {
    const errors = (result as any).error.errors.reduce((acc: any, current: any) => {
      const field = current.path[0];
      acc[field] = {
        type: 'validation',
        message: current.message,
      };
      return acc;
    }, {});

    return {
      values: {},
      errors,
    };
  }

  return {
    values: result.data,
    errors: {},
  };
};

export const LoginScreen = () => {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: customZodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await signIn(data);
    } catch (err: any) {
      console.log('Login Error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials and connection.';
      setServerError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerSection}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Awadh Crafts</Text>
          <Text style={styles.subtitle}>Warehouse packing verification system</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Sign In</Text>

            {serverError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{serverError}</Text>
              </View>
            )}

            {/* Email Field */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Email Address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    disabled={isSubmitting}
                    error={!!errors.email}
                    style={styles.input}
                    left={<TextInput.Icon icon="email" />}
                  />
                  {errors.email && (
                    <HelperText type="error" visible={true}>
                      {errors.email.message}
                    </HelperText>
                  )}
                </View>
              )}
            />

            {/* Password Field */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    disabled={isSubmitting}
                    error={!!errors.password}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  {errors.password && (
                    <HelperText type="error" visible={true}>
                      {errors.password.message}
                    </HelperText>
                  )}
                </View>
              )}
            />

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              LOG IN
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  subtitle: {
    fontSize: 14,
    color: '#78909C',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#37474F',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginBottom: 16,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#3F51B5',
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});
