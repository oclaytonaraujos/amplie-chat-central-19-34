/**
 * Demonstração da animação de carregamento da Aplie Chat
 * Este é um exemplo de como integrar a animação na aplicação
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AplieLoadingAnimation from './amplie-loading-animation';
import { AplieGlobalLoading, useAplieLoading } from './aplie-global-loading';

export const LoadingDemo: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(false);
  const { isLoading, startLoading, stopLoading } = useAplieLoading();

  // Simula carregamento da aplicação
  const simulateAppLoading = () => {
    setIsAppLoading(true);
    
    // Simula diferentes tempos de carregamento
    setTimeout(() => {
      setIsAppLoading(false);
    }, 5000);
  };

  // Simula carregamento manual
  const simulateManualLoading = () => {
    startLoading();
    
    setTimeout(() => {
      stopLoading();
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Animação de Carregamento - Aplie Chat</CardTitle>
          <CardDescription>
            Demonstração da animação de fragmentação e recomposição da logo da Aplie Chat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setShowDemo(true)}
              className="w-full"
            >
              Mostrar Animação Simples
            </Button>
            
            <Button 
              onClick={simulateAppLoading}
              variant="outline"
              className="w-full"
            >
              Simular Carregamento Global
            </Button>
            
            <Button 
              onClick={simulateManualLoading}
              variant="secondary"
              className="w-full"
            >
              Carregamento Manual
            </Button>
          </div>

          {/* Demonstração dos diferentes tamanhos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tamanhos Disponíveis:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <div key={size} className="text-center">
                  <p className="text-sm font-medium mb-2 capitalize">{size}</p>
                  <div className="relative h-24 border rounded-lg flex items-center justify-center bg-muted/20">
                    <AplieLoadingAnimation
                      isVisible={true}
                      size={size}
                      className="!fixed inset-0 !bg-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Código de exemplo */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Como usar:</h3>
            <div className="bg-muted p-4 rounded-lg text-sm font-mono">
              <pre>{`// Importar o componente
import AplieGlobalLoading from '@/components/ui/aplie-global-loading';

// No seu App.tsx ou componente principal
function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simula carregamento da aplicação
    setTimeout(() => setIsLoading(false), 3000);
  }, []);

  return (
    <>
      <AplieGlobalLoading 
        isAppLoading={isLoading}
        onLoadingComplete={() => console.log('Carregamento concluído!')}
        size="lg"
      />
      {/* Resto da aplicação */}
    </>
  );
}`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animação de demonstração simples */}
      <AplieLoadingAnimation
        isVisible={showDemo}
        onAnimationComplete={() => setShowDemo(false)}
        size="lg"
      />

      {/* Carregamento global */}
      <AplieGlobalLoading
        isAppLoading={isAppLoading}
        onLoadingComplete={() => console.log('App carregado!')}
        size="xl"
      />
    </div>
  );
};