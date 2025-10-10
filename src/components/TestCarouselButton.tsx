import React, { useState } from 'react';
import { TestTube } from 'lucide-react';
import { CarouselEditorModal } from '../Carousel-Editor';

const TestCarouselButton: React.FC = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const testData = {
    dados_gerais: {
      nome: "Workez AI",
      arroba: "workez.ai",
      foto_perfil: "https://i.imgur.com/Burtq0n.png",
      template: "2"
    },
    conteudos: [
      {
        title: "O jeito de trabalhar mudou — e a OpenAI sabe disso.",
        subtitle: "Mais de 300 prompts prontos para cada área, de vendas a engenharia. Tudo gratuito.",
        imagem_fundo: "https://platform.theverge.com/wp-content/uploads/sites/2/2025/02/openai-old-logo.png?quality=90&strip=all&crop=7.8125%2C0%2C84.375%2C100&w=2400",
        imagem_fundo2: "https://framerusercontent.com/images/3QoIJiw9cgCCDzhvxAaCxtdw80w.png",
        imagem_fundo3: "https://tii.imgix.net/production/articles/13747/fef35a3e-09ad-4c4c-be7f-ff36508f71cb.png?auto=compress&fit=crop&auto=format"
      },
      {
        title: "Esses pacotes foram pensados para acelerar quem vive de resolver problemas.",
        subtitle: "Marketing, produto, RH, TI, atendimento… cada conjunto entrega tarefas já traduzidas em linguagem de IA.",
        imagem_fundo: "https://www.nitsotech.com/wp-content/uploads/productivity-tools.webp",
        imagem_fundo2: "https://www.timechamp.io/blogs/wp-content/uploads/2024/06/Best-Productivity-Tools.jpg",
        imagem_fundo3: "https://quixy.com/wp-content/uploads/2021/08/Top-Productivity-Tools.png"
      },
      {
        title: "Nada de começar do zero: os prompts foram criados por especialistas.",
        subtitle: "É só copiar, colar e adaptar. Qualquer um pode parecer um time inteiro com a ajuda certa.",
        imagem_fundo: "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=535927066096394",
        imagem_fundo2: "https://substackcdn.com/image/fetch/$s_!vlof!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F85b96d8b-3b29-4906-a7fb-d257134cd6c4_2364x1582.png",
        imagem_fundo3: "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10174313955930347"
      },
      {
        title: "O novo profissional não decora comandos. Ele domina atalhos.",
        subtitle: "Prompts bem escritos fazem a IA entregar mais — e deixam você livre para o que importa.",
        imagem_fundo: "https://helpx.adobe.com/content/dam/help/en/illustrator/pdf/Ai_cheat-sheet_macOS.jpg",
        imagem_fundo2: "https://99designs-blog.imgix.net/blog/wp-content/uploads/2012/01/Illustrator-Guide2.png?auto=format&q=60&fit=max&w=930",
        imagem_fundo3: "https://academyclass.com/wp-content/uploads/2017/07/Illustrator-CS6_shortcut-PC-01-1-scaled-1.jpg"
      },
      {
        title: "Chegou a era dos kits de produtividade com IA.",
        subtitle: "Não é sobre saber tudo; é sobre saber usar quem sabe. E agora, quem sabe está compartilhando.",
        imagem_fundo: "https://storage.googleapis.com/msgsndr/XrIdTyn14oVuen4s040s/media/689e1f025dc21c3380a9dae4.png",
        imagem_fundo2: "https://images.ctfassets.net/lzny33ho1g45/6VcDGWbQfWElVwAiMWLk9c/54a88cca295511333240c2919fc3f084/best-ai-productivity.jpg",
        imagem_fundo3: "https://blog.topseokit.com/wp-content/uploads/2023/04/best-ai-productivity-tools-in-2023.webp"
      },
      {
        title: "Enquanto muitos ainda resistem, empresas treinam times com IA desde o onboarding.",
        subtitle: "Quem aprende mais rápido, soluciona melhor. E ninguém gosta de trabalhar com quem fica pra trás.",
        imagem_fundo: "https://dz2cdn1.dzone.com/storage/temp/17616967-ai-training-and-inference.jpeg",
        imagem_fundo2: "https://wintradoacademy.com/wp-content/uploads/2024/10/AI-Training-Rect.w.o-logo-2048x1117-1.jpg",
        imagem_fundo3: "https://itbrief.com.au/uploads/story/2023/12/05/img-6tm2QLYSDfROyIM1G15A6p9S.webp"
      },
      {
        title: "Não importa se você lidera ou executa — tem prompt pra você.",
        subtitle: "Gerente ou estagiário, marketing ou engenharia: a inteligência que transforma seu dia cabe num comando.",
        imagem_fundo: "https://media.licdn.com/dms/image/v2/D5622AQHK38-yGa8SSw/feedshare-shrink_800/feedshare-shrink_800/0/1725368073481?e=2147483647&v=beta&t=svsWH-IAZhebt4HyDkDY-D1_rGjWsMcCCNVoJ57Z5D8",
        imagem_fundo2: "https://miro.medium.com/1*riOphkPiaUVgkzT-P2wWsg.png",
        imagem_fundo3: "https://www.fynzo.com/wp-content/uploads/2021/03/3-1024x936.jpg"
      },
      {
        title: "Quem domina linguagem de prompt não depende de ninguém.",
        subtitle: "Quer agilidade? Quer escala? Quer relevância? Comece falando IA fluentemente.",
        imagem_fundo: "https://public-creator-assets-prod.skillshare.com/hosts%2FSiGwrliJ0RgzELY5iWZppQvqe6g1%2Fd3d01001-51c7-446a-8968-478ce7da5cf5-320ac2be-0823-4228-ac5d-85d6a7f60f07-cover-ai-image-prompt-mastery-copy.jpg",
        imagem_fundo2: "https://media.licdn.com/dms/image/v2/D5622AQHnoBxrh0REWg/feedshare-shrink_800/B56ZkuT74EJoAg-/0/1757418603385?e=2147483647&v=beta&t=ouEj8cPUAQwMl5gSjAe5RIOQ4KSgCI-mtrGW1kmcvLc",
        imagem_fundo3: "https://www.casedone.ai/courses/prompt-mastery-asset/prompt-mastery-course-title.jpg"
      },
      {
        title: "Mas atenção: copiar prompts sem contexto pode te travar mais do que ajudar.",
        subtitle: "Use como ponto de partida – não como muleta. Inteligência artificial reforça a sua, não substitui.",
        imagem_fundo: "https://willdom.com/wp-content/uploads/2024/09/Best-Practices-for-Using-AI-Tools-Effectively-in-Your-Business.webp",
        imagem_fundo2: "https://evalian.co.uk/wp-content/uploads/2025/07/AI-Governance-Top-10-Tips-for-AI-Use_2-768x2256.png",
        imagem_fundo3: "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=1170967905062510"
      },
      {
        title: "Comente 'PROMPT' no post ou acesse o link da bio: desbloqueie agora o acervo oficial gratuito da OpenAI para cada profissão.",
        imagem_fundo: "https://img.etimg.com/photo/msid-119043723,imgsize-111102/Anatomyofaprompt.jpg",
        imagem_fundo2: "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122103263978164070",
        imagem_fundo3: "https://preview.redd.it/openai-has-released-a-new-o1-prompting-guide-v0-0s8guxn3d2qd1.png?width=1000&format=png&auto=webp&s=c635b5719c55af64c1ed5ea5d31c0233c374b009"
      }
    ]
  };

  const handleTestClick = () => {
    console.log('Test button clicked, opening editor modal');
    setIsEditorOpen(true);
  };

  return (
    <>
      <CarouselEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        carouselData={testData}
      />
      <button
        onClick={handleTestClick}
        className="fixed bottom-24 right-4 md:bottom-4 z-50 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transition-all"
        title="Test Carousel Editor"
      >
        <TestTube className="w-5 h-5" />
        <span className="font-medium">Test Editor</span>
      </button>
    </>
  );
};

export default TestCarouselButton;
