import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { ONBOARDING_QUESTIONS, ARCHETYPES } from "../../../shared/carbonData";
import { IconArrowForward, IconArrowLeft, IconCheckmark, IconLeaf, IconStar } from "@/components/Icons";
import { toast } from "sonner";
import type { OnboardingResult, RoadmapPhase } from "@shared/viewModels";

export default function Onboarding() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<OnboardingResult | null>(null);

  const completeMutation = trpc.user.completeOnboarding.useMutation({
    onSuccess: (data) => {
      setResult(data as OnboardingResult);
      setStep(ONBOARDING_QUESTIONS.length + 1);
    },
    onError: (e) => toast.error(e.message),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <IconLeaf className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-xl font-bold">Sign in to get your Carbon DNA</h2>
          <a href={getLoginUrl()} className="btn-primary px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
            <IconStar className="w-4 h-4" /> Sign In
          </a>
        </div>
      </div>
    );
  }

  const q = ONBOARDING_QUESTIONS[step];
  const isLast = step === ONBOARDING_QUESTIONS.length - 1;
  const progress = (step / ONBOARDING_QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    if (isLast) {
      completeMutation.mutate({ answers: newAnswers });
    } else {
      setStep((current) => current + 1);
    }
  };

  if (result) {
    const arch = ARCHETYPES[result.archetype.id as keyof typeof ARCHETYPES];

    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-indigo-600/5 animate-ping opacity-20" />
            </div>
            <div className="relative w-32 h-32 rounded-full bg-indigo-600/10 border-2 border-primary/40 flex items-center justify-center mx-auto text-6xl">
              {arch?.icon ?? ""}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Your Carbon DNA</div>
            <h1 className="text-3xl font-black text-white mb-2">{arch?.label ?? result.archetype.label}</h1>
            <p className="text-white/50">{arch?.description ?? "You're on your carbon reduction journey."}</p>
          </div>

          <div className="card-glass rounded-xl border border-primary/20 p-5 text-left">
            <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <IconCheckmark className="w-4 h-4 text-white/70" /> Your 90-Day Roadmap
            </div>
            {result.roadmap.phases.slice(0, 3).map((phase: RoadmapPhase) => (
              <div key={phase.phase} className="mb-3">
                <div className="text-xs font-bold text-primary mb-1">
                  Phase {phase.phase}: {phase.title}
                </div>
                {phase.actions.slice(0, 2).map((action, i) => (
                  <div key={i} className="text-xs text-white/50 flex items-start gap-2 mb-1">
                    <span className="text-primary mt-0.5">→</span>
                    {action.action}
                    <span className="text-white/70 ml-auto flex-shrink-0">-{action.carbonSavingKg}kg</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary px-8 py-3 rounded-xl font-bold text-lg w-full flex items-center justify-center gap-2"
          >
            <IconStar className="w-5 h-5" /> Enter ReBon
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-600/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <IconLeaf className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-gradient-primary">Discover Your Carbon DNA</h1>
          <p className="text-white/50 text-sm mt-2">
            Answer {ONBOARDING_QUESTIONS.length} quick questions to get your personalized profile
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/50">
            <span>Question {step + 1} of {ONBOARDING_QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {q && (
          <div className="card-glass rounded-2xl border border-white/10 p-8 space-y-6">
            <div>
              <div className="text-xs font-bold tracking-widest text-primary uppercase mb-3">{q.category}</div>
              <h2 className="text-xl font-bold text-white">{q.question}</h2>
            </div>
            <div className="space-y-3">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(opt.value)}
                  disabled={completeMutation.isPending}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
                    answers[q.id] === opt.value
                      ? "border-primary bg-indigo-600/10 text-white"
                      : "border-white/10 bg-white/5/30 hover:border-primary/50 hover:bg-indigo-600/5 text-white"
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              {step > 0 && (
                <button
                  onClick={() => setStep((current) => current - 1)}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <IconArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <div className="ml-auto text-xs text-white/50 flex items-center gap-1">
                {isLast ? "Last question" : <><IconArrowForward className="w-3 h-3" /> Select to continue</>}
              </div>
            </div>
          </div>
        )}

        {completeMutation.isPending && (
          <div className="text-center text-sm text-primary animate-pulse flex items-center justify-center gap-2">
            <IconStar className="w-4 h-4" /> Analyzing your Carbon DNA...
          </div>
        )}
      </div>
    </div>
  );
}
