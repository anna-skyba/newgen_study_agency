
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

import {
  NavigationEnd,
  Router
} from '@angular/router';

import { filter, Subscription } from 'rxjs';
import { LeadFormComponent } from './lead-form.component';

type Tab =
    | 'home'
    | 'about'
    | 'universities'
    | 'quiz'
    | 'pricing'
    | 'reviews'
    | 'contact';

type Language = 'uk' | 'ru';

type Localized = {
  uk: string;
  ru: string;
};

type Specialty =
    | 'medicine'
    | 'it'
    | 'engineering'
    | 'logistics'
    | 'economics'
    | 'design'
    | 'other';

type MatchMode =
    | 'exact'
    | 'alternative'
    | 'explore'
    | 'exploreOtherCity';

interface University {
  name: string;
  cityId: string;
  city: Localized;
  image: string;
  aliases: string;
  specialties: Specialty[];
  focus: Localized;
}

interface QuizOption {
  value: string;
  title: Localized;
}

interface QuizQuestion {
  id: string;
  title: Localized;
  options: QuizOption[];
}

interface Review {
  name: Localized;
  university: string;
  text: Localized;
}

interface StoryPress {
  pointerId: number;
  x: number;
  y: number;
  timestamp: number;
}

const tr = (uk: string, ru: string): Localized => ({
  uk,
  ru
});

@Component({
  selector: 'app-newgen-page',
  standalone: true,
  imports: [LeadFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {

  @ViewChild('storyScrollable')
  storyScrollable?: ElementRef<HTMLElement>;

  language: Language = 'uk';
  activeTab: Tab = 'home';

  private readonly routeSubscription: Subscription;

  constructor(
      private readonly router: Router,
      private readonly cdr: ChangeDetectorRef
  ) {
    this.routeSubscription = this.router.events
        .pipe(
            filter(
                (event): event is NavigationEnd =>
                    event instanceof NavigationEnd
            )
        )
        .subscribe(event => {
          this.syncTab(event.urlAfterRedirects);
        });

    this.syncTab(this.router.url);
  }

  // ======================================
  // ROUTING
  // ======================================

  readonly tabPaths: Record<Tab, string> = {
    home: '/',
    about: '/about',
    universities: '/universities',
    quiz: '/quiz',
    pricing: '/pricing',
    reviews: '/reviews',
    contact: '/contact'
  };

  tabs: { id: Tab; name: Localized }[] = [
    { id: 'home', name: tr('Головна', 'Главная') },
    { id: 'about', name: tr('Про нас', 'О нас') },
    {
      id: 'universities',
      name: tr('Університети', 'Университеты')
    },
    { id: 'quiz', name: tr('Підбір', 'Подбор') },
    { id: 'pricing', name: tr('Послуги', 'Услуги') },
    { id: 'reviews', name: tr('Відгуки', 'Отзывы') },
    { id: 'contact', name: tr('Контакти', 'Контакты') }
  ];

  private syncTab(url: string): void {
    const path =
        url.split(/[?#]/)[0].replace(/\/+$/, '') || '/';

    const nextTab =
        (Object.keys(this.tabPaths) as Tab[])
            .find(tab => this.tabPaths[tab] === path) ?? 'home';

    const changed = this.activeTab !== nextTab;

    if (changed) {
      this.stopReviewTimer();

      this.activeTab = nextTab;
      this.isStoryHeld = false;
      this.activeStoryPress = null;

      if (nextTab === 'reviews') {
        this.storyElapsedMs = 0;
        this.startReviewTimer();
      }

      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }

    this.updatePageTitle();
    this.cdr.markForCheck();
  }

  changeTab(tab: Tab): void {
    if (tab === this.activeTab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    void this.router.navigateByUrl(this.tabPaths[tab]);
  }

  private updatePageTitle(): void {
    const page = this.tabs.find(
        tab => tab.id === this.activeTab
    );

    document.title =
        `${page ? this.l(page.name) : 'NewGen Study'} — NewGen Study`;
  }

  // ======================================
  // LANGUAGE
  // ======================================

  l(value: Localized): string {
    return value[this.language];
  }

  setLanguage(language: Language): void {
    this.language = language;
    document.documentElement.lang = language;

    this.updatePageTitle();

    if (this.activeTab === 'reviews') {
      this.stopReviewTimer();
      this.storyElapsedMs = 0;
      this.startReviewTimer();
    }

    this.cdr.markForCheck();
  }

  // ======================================
  // HEADERS
  // ======================================

  pageHeaders: Record<Tab, {
    eyebrow: string;
    title: Localized;
    accent: Localized;
    description: Localized;
  }> = {
    home: {
      eyebrow: 'NEWGEN STUDY AGENCY',
      title: tr(
          'Навчання у Словаччині може бути',
          'Обучение в Словакии может быть'
      ),
      accent: tr('безкоштовним.', 'бесплатным.'),
      description: tr(
          'NewGen Study допоможе обрати університет, підготувати документи та впевнено пройти шлях до вступу у Словаччині.',
          'NewGen Study поможет выбрать университет, подготовить документы и уверенно пройти путь к поступлению в Словакии.'
      )
    },
    about: {
      eyebrow: 'NEWGEN STUDY AGENCY',
      title: tr('Про', 'О'),
      accent: tr('NewGen Study.', 'NewGen Study.'),
      description: tr(
          'Допомога з вибором університету, документами та супроводом вступу.',
          'Помощь с выбором университета, документами и сопровождением поступления.'
      )
    },
    universities: {
      eyebrow: 'NEWGEN STUDY / UNIVERSITIES',
      title: tr('Знайди свій', 'Найди свой'),
      accent: tr('університет.', 'университет.'),
      description: tr(
          'Університети Словаччини, напрями навчання та можливості для майбутніх студентів.',
          'Университеты Словакии, направления обучения и возможности для будущих студентов.'
      )
    },
    quiz: {
      eyebrow: 'NEWGEN STUDY / UNIVERSITY MATCH',
      title: tr('Знайди своє', 'Найди своё'),
      accent: tr('місце навчання.', 'место обучения.'),
      description: tr(
          'Відповідай на кілька запитань та отримай попередній підбір університетів.',
          'Ответь на несколько вопросов и получи предварительный подбор университетов.'
      )
    },
    pricing: {
      eyebrow: 'NEWGEN STUDY / SERVICES',
      title: tr('Обери свій', 'Выбери свой'),
      accent: tr('пакет супроводу.', 'пакет сопровождения.'),
      description: tr(
          'Обери пакет послуг для вступу до університетів Словаччини.',
          'Выбери пакет услуг для поступления в университеты Словакии.'
      )
    },
    reviews: {
      eyebrow: 'NEWGEN STUDY / REVIEWS',
      title: tr('Історії', 'Истории'),
      accent: tr('студентів.', 'студентов.'),
      description: tr(
          'Реальні враження від співпраці з NewGen Study.',
          'Реальные впечатления от сотрудничества с NewGen Study.'
      )
    },
    contact: {
      eyebrow: 'NEWGEN STUDY / CONTACT',
      title: tr('Зв’яжися', 'Свяжись'),
      accent: tr('з нами.', 'с нами.'),
      description: tr(
          'Розкажи про свої плани щодо навчання в Словаччині — ми допоможемо визначитися з наступними кроками.',
          'Расскажи о своих планах обучения в Словакии — мы поможем определиться со следующими шагами.'
      )
    }
  };

  // ======================================
  // UNIVERSITIES
  // ======================================

  universities: University[] = [
    {
      name: 'Technická univerzita v Košiciach',
      cityId: 'kosice',
      city: tr('Кошице', 'Кошице'),
      image: 'assets/university-9094.png',
      aliases: 'TUKE ТУКЕ технічний технический kosice košice',
      specialties: [
        'it', 'engineering', 'logistics',
        'economics', 'design'
      ],
      focus: tr(
          'IT, інженерія, техніка, логістика, економіка, дизайн та архітектура',
          'IT, инженерия, техника, логистика, экономика, дизайн и архитектура'
      )
    },
    {
      name: 'Univerzita Pavla Jozefa Šafárika v Košiciach',
      cityId: 'kosice',
      city: tr('Кошице', 'Кошице'),
      image: 'assets/university-9167.png',
      aliases: 'UPJŠ UPJS Шафарик Шафарика kosice košice',
      specialties: ['medicine', 'it'],
      focus: tr(
          'Медицина, біологія, інформатика, природничі науки',
          'Медицина, биология, информатика, естественные науки'
      )
    },
    {
      name: 'Žilinská univerzita v Žiline',
      cityId: 'zilina',
      city: tr('Жиліна', 'Жилина'),
      image: 'assets/university-9171.png',
      aliases: 'UNIZA Жилінський Жилинский zilina žilina',
      specialties: [
        'it', 'engineering', 'logistics', 'economics'
      ],
      focus: tr(
          'IT, інженерія, транспорт, логістика, менеджмент та економіка',
          'IT, инженерия, транспорт, логистика, менеджмент и экономика'
      )
    },
    {
      name: 'Univerzita veterinárskeho lekárstva a farmácie v Košiciach',
      cityId: 'kosice',
      city: tr('Кошице', 'Кошице'),
      image: 'assets/university-9173.png',
      aliases: 'UVLF ветеринарний ветеринарный фармація фармация',
      specialties: ['medicine'],
      focus: tr(
          'Ветеринарна медицина, фармація',
          'Ветеринарная медицина, фармация'
      )
    },
    {
      name: 'Slovenská technická univerzita v Bratislave',
      cityId: 'bratislava',
      city: tr('Братислава', 'Братислава'),
      image: 'assets/university-9177.png',
      aliases: 'STU словацький технічний словацкий технический',
      specialties: ['it', 'engineering', 'economics', 'design'],
      focus: tr(
          'IT, інженерія, технології, менеджмент, дизайн та архітектура',
          'IT, инженерия, технологии, менеджмент, дизайн и архитектура'
      )
    },
    {
      name: 'Univerzita Komenského v Bratislave',
      cityId: 'bratislava',
      city: tr('Братислава', 'Братислава'),
      image: 'assets/university-9179.png',
      aliases: 'UK Коменського Коменского',
      specialties: ['medicine', 'it', 'economics'],
      focus: tr(
          'Медицина, біологія, інформатика, менеджмент та інші напрями',
          'Медицина, биология, информатика, менеджмент и другие направления'
      )
    },
    {
      name: 'Ekonomická univerzita v Bratislave',
      cityId: 'bratislava',
      city: tr('Братислава', 'Братислава'),
      image: 'assets/university-9175.png',
      aliases: 'EUBA економічний экономический',
      specialties: ['it', 'economics'],
      focus: tr(
          'Економіка, фінанси, бізнес, менеджмент, економічна інформатика',
          'Экономика, финансы, бизнес, менеджмент, экономическая информатика'
      )
    }
  ];

  universitySearch = '';

  private normalizeSearch(text: string): string {
    return text
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
  }

  get filteredUniversities(): University[] {
    const query = this.normalizeSearch(this.universitySearch);

    if (!query) return this.universities;

    return this.universities.filter(uni =>
        this.normalizeSearch(
            `${uni.name} ${uni.city.uk} ${uni.city.ru} ${uni.aliases}`
        ).includes(query)
    );
  }

  // ======================================
  // BENEFITS
  // ======================================

  benefits = [
    {
      icon: 'bi bi-patch-check',
      title: tr('100% гарантія вступу', '100% гарантия поступления'),
      description: tr(
          'NewGen Study гарантує успішний вступ відповідно до умов договору. Ми допоможемо підібрати університет, підготувати документи та пройти всі етапи вступу.',
          'NewGen Study гарантирует успешное поступление в соответствии с условиями договора. Мы поможем выбрать университет, подготовить документы и пройти все этапы поступления.'
      )
    },
    {
      icon: 'bi bi-headset',
      title: tr(
          'Підтримка протягом усього навчання',
          'Поддержка на протяжении всего обучения'
      ),
      description: tr(
          'Ми залишаємося на зв’язку зі студентами протягом навчання у Словаччині та допомагаємо з питаннями, які виникають.',
          'Мы остаёмся на связи со студентами на протяжении обучения в Словакии и помогаем с возникающими вопросами.'
      )
    },
    {
      icon: 'bi bi-mortarboard',
      title: tr('Безкоштовне навчання', 'Бесплатное обучение'),
      description: tr(
          'Навчання словацькою мовою на відповідних денних програмах державних університетів за встановлених умов безкоштовне.',
          'Обучение на словацком языке на соответствующих дневных программах государственных университетов при установленных условиях бесплатное.'
      )
    },
    {
      icon: 'bi bi-award',
      title: tr(
          'Диплом європейського зразка',
          'Диплом европейского образца'
      ),
      description: tr(
          'Словацькі університети входять до європейського простору вищої освіти, що відкриває можливості для навчання та кар’єри.',
          'Словацкие университеты входят в европейское пространство высшего образования, открывая возможности для учёбы и карьеры.'
      )
    },
    {
      icon: 'bi bi-airplane',
      title: tr('Подорожі Європою', 'Путешествия по Европе'),
      description: tr(
          'За наявності необхідних документів студенти можуть подорожувати країнами Шенгенської зони.',
          'При наличии необходимых документов студенты могут путешествовать по странам Шенгенской зоны.'
      )
    },
    {
      icon: 'bi bi-people',
      title: tr('Програма Erasmus+', 'Программа Erasmus+'),
      description: tr(
          'Багато університетів пропонують студентські обміни та міжнародні стажування.',
          'Многие университеты предлагают студенческие обмены и международные стажировки.'
      )
    },
    {
      icon: 'bi bi-chat-dots',
      title: tr(
          'Легка для вивчення мова',
          'Лёгкий для изучения язык'
      ),
      description: tr(
          'NewGen Study допоможе з вивченням словацької мови та підготовкою до навчання.',
          'NewGen Study поможет с изучением словацкого языка и подготовкой к учёбе.'
      )
    },
    {
      icon: 'bi bi-shield-check',
      title: tr('Безпечна країна', 'Безопасная страна'),
      description: tr(
          'Словаччина пропонує відносно безпечне та комфортне середовище для студентського життя.',
          'Словакия предлагает относительно безопасную и комфортную среду для студенческой жизни.'
      )
    }
  ];

  trustReasons = [
    {
      title: tr('Індивідуальний підбір', 'Индивидуальный подбор'),
      description: tr(
          'Підбираємо університети відповідно до інтересів, міста та побажань студента.',
          'Подбираем университеты с учётом интересов, города и пожеланий студента.'
      )
    },
    {
      title: tr('Підготовка документів', 'Подготовка документов'),
      description: tr(
          'Допомагаємо з перекладами, мотиваційними листами та заявками.',
          'Помогаем с переводами, мотивационными письмами и заявлениями.'
      )
    },
    {
      title: tr(
          'Комунікація з університетом',
          'Общение с университетом'
      ),
      description: tr(
          'Організовуємо спілкування з університетом від імені студента.',
          'Организуем общение с университетом от имени студента.'
      )
    },
    {
      title: tr('Подальший супровід', 'Дальнейшее сопровождение'),
      description: tr(
          'Допомагаємо з організаційними питаннями після вступу.',
          'Помогаем с организационными вопросами после поступления.'
      )
    }
  ];

  steps = [
    tr('Підбір університету', 'Подбор университета'),
    tr('Підготовка документів', 'Подготовка документов'),
    tr('Подача заявок', 'Подача заявок'),
    tr(
        'Комунікація з університетом',
        'Общение с университетом'
    ),
    tr('Зарахування', 'Зачисление'),
    tr('Подальший супровід', 'Дальнейшее сопровождение')
  ];

  // ======================================
  // SERVICES
  // ======================================

  services: Localized[] = [
    tr('Підбір університету', 'Подбор университета'),
    tr(
        'Переклад усіх документів (атестат, виписка оцінок тощо)',
        'Перевод всех документов (аттестат, выписка оценок и т. д.)'
    ),
    tr(
        'Написання мотиваційного листа та біографії словацькою мовою',
        'Написание мотивационного письма и биографии на словацком языке'
    ),
    tr(
        'Формування та подача повного пакета документів до університету',
        'Формирование и подача полного пакета документов в университет'
    ),
    tr(
        'Комунікація з університетом від імені студента',
        'Общение с университетом от имени студента'
    ),
    tr('Оплата студентського квитка', 'Оплата студенческого билета'),
    tr(
        'Реєстрація на онлайн-іспити за потреби',
        'Регистрация на онлайн-экзамены при необходимости'
    ),
    tr(
        'Отримання листа про зарахування, підготовка документів для візи D та їх відправка',
        'Получение письма о зачислении, подготовка документов для визы D и их отправка'
    ),
    tr(
        'Реєстрація електронного кабінету студента',
        'Регистрация электронного кабинета студента'
    ),
    tr('Подача заяви на гуртожиток', 'Подача заявления на общежитие'),
    tr(
        'Супровід у банку для відкриття рахунку',
        'Сопровождение в банке для открытия счёта'
    ),
    tr(
        'Супровід при покупці SIM-карти',
        'Сопровождение при покупке SIM-карты'
    ),
    tr(
        'Супровід студента на заселення до гуртожитку',
        'Сопровождение студента при заселении в общежитие'
    ),
    tr(
        'Реєстрація на медичну комісію після отримання ВНЖ',
        'Запись на медицинскую комиссию после получения ВНЖ'
    ),
    tr(
        'Підготовка документів для подачі на ВНЖ',
        'Подготовка документов для подачи на ВНЖ'
    ),
    tr(
        'Супровід студента в поліцію для подачі документів',
        'Сопровождение студента в полицию для подачи документов'
    ),
    tr(
        'Допомога в заповненні документів для ВНЖ',
        'Помощь в заполнении документов для ВНЖ'
    ),
    tr(
        'Квиток на поїзд по Словаччині до вибраного міста',
        'Билет на поезд по Словакии до выбранного города'
    ),
    tr('Зустріч студента на вокзалі', 'Встреча студента на вокзале')
  ];

  packages = [
    {
      name: tr('Економ', 'Эконом'),
      price: 890,
      applications: 1,
      included: 11,
      featured: false
    },
    {
      name: tr('Комфорт', 'Комфорт'),
      price: 1190,
      applications: 2,
      included: 15,
      featured: true
    },
    {
      name: tr('Преміум', 'Премиум'),
      price: 1290,
      applications: 2,
      included: 19,
      featured: false
    }
  ];

  hasService(
      serviceIndex: number,
      packageIndex: number
  ): boolean {
    return serviceIndex < this.packages[packageIndex].included;
  }

  selectedPackageName = '';
  managerRequestVisible = false;

  selectPackage(pack: { price: number }): void {
    const names: Record<number, string> = {
      890: 'Економ',
      1190: 'Комфорт',
      1290: 'Преміум'
    };

    this.selectedPackageName = names[pack.price] ?? '';
    this.managerRequestVisible = false;

    this.changeTab('contact');
  }

  // ======================================
  // QUIZ
  // ======================================

  studyDirections: QuizOption[] = [
    {
      value: 'medicine',
      title: tr(
          '🧬 Медицина / біологія / здоров’я',
          '🧬 Медицина / биология / здоровье'
      )
    },
    {
      value: 'it',
      title: tr(
          '💻 IT / програмування',
          '💻 IT / программирование'
      )
    },
    {
      value: 'engineering',
      title: tr(
          '🏗️ Інженерія / техніка',
          '🏗️ Инженерия / техника'
      )
    },
    {
      value: 'logistics',
      title: tr(
          '💼 Менеджмент / логістика / доставка',
          '💼 Менеджмент / логистика / доставка'
      )
    },
    {
      value: 'economics',
      title: tr(
          '💼 Економіка / менеджмент',
          '💼 Экономика / менеджмент'
      )
    },
    {
      value: 'design',
      title: tr(
          '🎨 Дизайн / архітектура',
          '🎨 Дизайн / архитектура'
      )
    }
  ];

  quizQuestions: QuizQuestion[] = [
    {
      id: 'specialty',
      title: tr(
          'Яка твоя омріяна спеціальність?',
          'Какая специальность твоя мечта?'
      ),
      options: [
        ...this.studyDirections,
        {
          value: 'other',
          title: tr(
              'Інше / немає у списку',
              'Другое / нет в списке'
          )
        }
      ]
    },
    {
      id: 'city',
      title: tr(
          'У якому місті плануєш навчатися?',
          'В каком городе планируешь учиться?'
      ),
      options: [
        { value: 'kosice', title: tr('Кошице', 'Кошице') },
        { value: 'bratislava', title: tr('Братислава', 'Братислава') },
        { value: 'zilina', title: tr('Жиліна', 'Жилина') },
        { value: 'nitra', title: tr('Нітра', 'Нитра') },
        { value: 'trnava', title: tr('Трнава', 'Трнава') },
        { value: 'presov', title: tr('Пряшів', 'Прешов') },
        { value: 'trencin', title: tr('Тренчин', 'Тренчин') },
        {
          value: 'banska',
          title: tr('Банська Бистриця', 'Банска-Бистрица')
        },
        { value: 'poprad', title: tr('Попрад', 'Попрад') },
        {
          value: 'any',
          title: tr(
              'Місто не має значення',
              'Город не имеет значения'
          )
        }
      ]
    },
    {
      id: 'language',
      title: tr(
          'Який твій рівень словацької мови?',
          'Какой у тебя уровень словацкого языка?'
      ),
      options: [
        {
          value: 'a0',
          title: tr('A0 — не знаю словацької', 'A0 — не знаю словацкий')
        },
        {
          value: 'a1',
          title: tr('A1–A2 — початковий', 'A1–A2 — начальный')
        },
        {
          value: 'b1',
          title: tr('B1–B2 — середній', 'B1–B2 — средний')
        },
        {
          value: 'c1',
          title: tr('C1–C2 — високий', 'C1–C2 — высокий')
        }
      ]
    },
    {
      id: 'exams',
      title: tr(
          'Чи готовий/готова складати вступні іспити?',
          'Готов/готова сдавать вступительные экзамены?'
      ),
      options: [
        {
          value: 'yes',
          title: tr('Так, готовий/готова', 'Да, готов/готова')
        },
        {
          value: 'no',
          title: tr(
              'Бажано вступити без іспитів',
              'Желательно поступить без экзаменов'
          )
        },
        {
          value: 'either',
          title: tr(
              'Розгляну обидва варіанти',
              'Рассмотрю оба варианта'
          )
        }
      ]
    }
  ];

  quizAnswers: Record<string, string> = {};
  customSpecialty = '';
  quizHasResults = false;
  quizTriedSubmit = false;

  selectQuizAnswer(id: string, value: string): void {
    this.quizAnswers[id] = value;
    this.quizHasResults = false;
    this.quizTriedSubmit = false;
  }

  isQuizSelected(id: string, value: string): boolean {
    return this.quizAnswers[id] === value;
  }

  updateCustomSpecialty(value: string): void {
    this.customSpecialty = value;
    this.quizHasResults = false;
  }

  get canSubmitQuiz(): boolean {
    return this.quizQuestions.every(
        question => !!this.quizAnswers[question.id]
    ) && (
        this.quizAnswers['specialty'] !== 'other' ||
        this.customSpecialty.trim().length > 1
    );
  }

  submitQuiz(): void {
    this.quizTriedSubmit = true;

    if (!this.canSubmitQuiz) return;

    this.quizHasResults = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editQuiz(): void {
    this.quizHasResults = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private getMatch(): {
    list: University[];
    mode: MatchMode;
  } {
    const specialty =
        this.quizAnswers['specialty'] as Specialty | undefined;

    const city = this.quizAnswers['city'];

    if (specialty === 'other') {
      const cityList = this.universities.filter(
          u => city === 'any' || u.cityId === city
      );

      return cityList.length
          ? { list: cityList, mode: 'explore' }
          : {
            list: this.universities,
            mode: 'exploreOtherCity'
          };
    }

    const bySpecialty = this.universities.filter(
        u => !!specialty && u.specialties.includes(specialty)
    );

    const exact = bySpecialty.filter(
        u => city === 'any' || u.cityId === city
    );

    return exact.length
        ? { list: exact, mode: 'exact' }
        : { list: bySpecialty, mode: 'alternative' };
  }

  get matchedUniversities(): University[] {
    return this.quizHasResults ? this.getMatch().list : [];
  }

  get matchDescription(): Localized {
    const descriptions: Record<MatchMode, Localized> = {
      exact: tr(
          'Ми знайшли університети, які відповідають обраному місту та загальному напряму навчання.',
          'Мы нашли университеты, соответствующие выбранному городу и общему направлению обучения.'
      ),
      alternative: tr(
          'У вибраному місті відповідних варіантів немає в нашому каталозі. Ось альтернативи в інших містах.',
          'В выбранном городе подходящих вариантов нет в нашем каталоге. Вот альтернативы в других городах.'
      ),
      explore: tr(
          'Ось університети вибраного міста. Для уточнення конкретної спеціальності звернися до менеджера.',
          'Вот университеты выбранного города. Для уточнения конкретной специальности обратись к менеджеру.'
      ),
      exploreOtherCity: tr(
          'У нашому каталозі поки немає університетів у вибраному місті. Ось інші варіанти.',
          'В нашем каталоге пока нет университетов в выбранном городе. Вот другие варианты.'
      )
    };

    return descriptions[this.getMatch().mode];
  }

  private getQuizAnswer(id: string): string {
    if (
        id === 'specialty' &&
        this.quizAnswers[id] === 'other'
    ) {
      return this.customSpecialty.trim();
    }

    const question = this.quizQuestions.find(q => q.id === id);
    const option = question?.options.find(
        o => o.value === this.quizAnswers[id]
    );

    return option ? this.l(option.title) : '—';
  }

  get managerRequest(): string {
    const labels = this.language === 'uk'
        ? ['Спеціальність', 'Місто', 'Мова', 'Іспити']
        : ['Специальность', 'Город', 'Язык', 'Экзамены'];

    const keys = ['specialty', 'city', 'language', 'exams'];

    const greeting = this.language === 'uk'
        ? 'Вітаю! Хочу отримати індивідуальний підбір університету.'
        : 'Здравствуйте! Хочу получить индивидуальный подбор университета.';

    return [
      greeting,
      '',
      ...keys.map(
          (key, i) => `${labels[i]}: ${this.getQuizAnswer(key)}`
      ),
      '',
      this.language === 'uk'
          ? 'Знайдені університети:'
          : 'Найденные университеты:',
      ...this.matchedUniversities.map(u => `• ${u.name}`)
    ].join('\n');
  }

  contactManager(): void {
    this.selectedPackageName = '';
    this.managerRequestVisible = true;
    this.changeTab('contact');
  }

  // ======================================
  // FAQ
  // ======================================

  faqItems = [
    {
      question: tr(
          'Чи справді навчання у Словаччині безкоштовне?',
          'Действительно ли обучение в Словакии бесплатное?'
      ),
      answer: tr(
          'Навчання словацькою мовою на відповідних денних програмах публічних і державних університетів зазвичай безкоштовне в межах стандартної тривалості.',
          'Обучение на словацком языке на соответствующих дневных программах публичных и государственных университетов обычно бесплатное в пределах стандартного срока.'
      )
    },
    {
      question: tr(
          'Чи можна вступити без іспитів?',
          'Можно ли поступить без экзаменов?'
      ),
      answer: tr(
          'Так, деякі програми не вимагають вступних іспитів. Умови залежать від університету та факультету.',
          'Да, некоторые программы не требуют вступительных экзаменов. Условия зависят от университета и факультета.'
      )
    },
    {
      question: tr(
          'Чи допомагаєте ви з вивченням мови?',
          'Помогаете ли вы с изучением языка?'
      ),
      answer: tr(
          'Так, NewGen Study допомагає зі словацькою мовою та підготовкою до навчання.',
          'Да, NewGen Study помогает со словацким языком и подготовкой к учёбе.'
      )
    },
    {
      question: tr(
          'Чи допомагаєте з гуртожитком?',
          'Помогаете с общежитием?'
      ),
      answer: tr(
          'Так, ми допомагаємо з подачею заяви. Надання місця залежить від університету.',
          'Да, мы помогаем с подачей заявления. Предоставление места зависит от университета.'
      )
    },
    {
      question: tr(
          'Коли краще починати підготовку?',
          'Когда лучше начинать подготовку?'
      ),
      answer: tr(
          'Якомога раніше, щоб встигнути підготувати документи й подати заявки вчасно.',
          'Как можно раньше, чтобы успеть подготовить документы и вовремя подать заявки.'
      )
    }
  ];

  // ======================================
  // REVIEWS
  // ======================================

  reviews: Review[] = [
    {
      name: tr('Мама студентки', 'Мама студентки'),
      university: 'UPJŠ',
      text: tr(
          `Добрий день, Олександре!

Ми дуже вдячні Вам за Ваше всебічне супроводження! Нарешті наша донька тепер студентка університету ім. П. Й. Шафарика! Ура!

Без Вашої допомоги вступ здавався для нас абсолютно нереальним. Ви зробили все можливе, щоб мрія доньки стала реальністю.

Окремо хочемо подякувати й Маргариті за уроки словацької мови. Тепер донька може впевнено спілкуватися, використовує мову й не боїться нею розмовляти.

Будемо рекомендувати Вас усім нашим знайомим. Як приємно, що Ви порядна, відповідальна, добра людина, яка допомогла нам!`,
          `Добрый день, Александр!

Мы очень Вам благодарны за Ваше полное сопровождение! Наконец наша дочь теперь студентка университета П. Й. Шафарика! Ура!

Без Вашей помощи поступление казалось для нас совершенно нереальным. Вы сделали всё возможное, чтобы мечта дочери стала реальностью.

Отдельно хотим поблагодарить Маргариту за уроки словацкого языка. Теперь дочь может уверенно общаться и не боится говорить.

Будем рекомендовать Вас всем нашим знакомым!`
      )
    },
    {
      name: tr('Ангеліна', 'Ангелина'),
      university: 'Truni',
      text: tr(
          `Вітаю! Окремо хотіла б висловити вдячність Вашій компанії, Олександре, за таку колосальну допомогу та працю! Рекомендую вас усім.

Коли ми до вас звернулися, ми були у відчаї. Ваш менеджер нас заспокоїв і розвіяв сумніви ще з першого дня, а викладачка словацької вселила надію на те, що все вийде.

Ніколи не забуду враження після Вашої екскурсії містом: приємні люди, затишна атмосфера та маленькі подаруночки запали мені в серце :)

Дякую Вам!`,
          `Приветствую! Отдельно хотела бы выразить благодарность Вашей компании, Александр, за такую колоссальную помощь и труд! Рекомендую вас всем, честно говоря.

К тому моменту, как напали на вас, мы были в отчаянии. Ваш менеджер нас успокоил и развеял все сомнения еще с первого дня, а преподавательница словацкой вселила надежду на то, что все получится.

Никогда не забуду впечатления после Вашей экскурсии по городу: приятные люди, уютная атмосфера и маленькие подарочки впали мне в сердце :)

Спасибо Вам!`
      )
    },
    {
      name: tr(
          'Мама студента Максима',
          'Мама студента Максима'
      ),
      university: 'TUKE',
      text: tr(
          `Хочу висловити величезну вдячність Олександру за допомогу зі вступом мого сина до університету Словаччини!

Із самого початку було зрозуміло, що людина справді розуміється на своїй справі. Усі питання вирішувалися чітко, своєчасно та без зайвих складнощів.

У нас була трохи нестандартна ситуація, оскільки син вступав після коледжу, а не після школи. Але Олександр у всьому розібрався, допоміг із документами та успішно довів справу до вступу.

Окремо хочу зазначити, що допомога не закінчилася на етапі зарахування. Олександр продовжує залишатися на зв’язку, відповідає на запитання й допомагає з подальшими організаційними моментами.

Можу сміливо рекомендувати Олександра всім, хто планує вступати до Словаччини!`,
          `Хочу выразить огромную благодарность Александру за помощь с поступлением моего сына в университет Словакии!

С самого начала было понятно, что человек действительно разбирается в своём деле. Все вопросы решались чётко, своевременно и без лишних сложностей. Особенно приятно, что стоимость услуг вполне доступная, а качество сопровождения ничем не уступает крупным образовательным агентствам.

У нас была немного нестандартная ситуация, поскольку сын поступал после колледжа, а не после школы. Но Александр во всём разобрался, помог с документами и успешно довёл дело до поступления.

Отдельно хочу отметить, что помощь не закончилась на этапе зачисления. Александр продолжает оставаться на связи, отвечает на возникающие вопросы и помогает с дальнейшими организационными моментами.

Очень рада, что мы обратились именно к нему. Могу смело рекомендовать Александра всем, кто планирует поступать в Словакию. Ответственный, порядочный человек, который знает своё дело и действительно заинтересован в результате!`
      )
    }
  ];

  reviewIndex = 0;
  isReviewPaused = false;
  isStoryHeld = false;

  private reviewTimer: ReturnType<typeof setInterval> | null = null;
  private storyElapsedMs = 0;
  private storyLastTick = 0;
  private activeStoryPress: StoryPress | null = null;

  get activeReview(): Review {
    return this.reviews[this.reviewIndex];
  }

  get storyIsStopped(): boolean {
    return this.isReviewPaused || this.isStoryHeld;
  }

  get reviewInterval(): number {
    const words = this.l(this.activeReview.text)
        .split(/\s+/)
        .filter(Boolean).length;

    return Math.max(
        16000,
        Math.min(90000, 4500 + words * 360)
    );
  }

  storyProgress(index: number): number {
    if (index < this.reviewIndex) return 100;
    if (index > this.reviewIndex) return 0;

    return Math.min(
        100,
        this.storyElapsedMs / this.reviewInterval * 100
    );
  }

  private stopReviewTimer(): void {
    if (this.reviewTimer) {
      clearInterval(this.reviewTimer);
      this.reviewTimer = null;
    }
  }

  private resetStoryScroll(): void {
    this.storyScrollable?.nativeElement.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }

  private updateStoryClock(): void {
    if (
        this.activeTab !== 'reviews' ||
        this.storyIsStopped
    ) return;

    const now = Date.now();

    if (document.hidden) {
      this.storyLastTick = now;
      return;
    }

    this.storyElapsedMs += Math.max(
        0,
        Math.min(now - this.storyLastTick, 250)
    );

    this.storyLastTick = now;

    if (this.storyElapsedMs >= this.reviewInterval) {
      this.advanceReview(1);
      return;
    }

    this.cdr.markForCheck();
  }

  private startReviewTimer(): void {
    this.stopReviewTimer();

    if (
        this.activeTab !== 'reviews' ||
        this.storyIsStopped
    ) return;

    this.storyLastTick = Date.now();

    this.reviewTimer = setInterval(
        () => this.updateStoryClock(),
        50
    );
  }

  private advanceReview(direction: 1 | -1): void {
    this.stopReviewTimer();

    this.reviewIndex =
        (this.reviewIndex + direction + this.reviews.length)
        % this.reviews.length;

    this.storyElapsedMs = 0;
    this.resetStoryScroll();

    this.cdr.markForCheck();
    this.startReviewTimer();
  }

  nextReview(): void {
    this.advanceReview(1);
  }

  previousReview(): void {
    this.advanceReview(-1);
  }

  showReview(index: number): void {
    this.stopReviewTimer();
    this.reviewIndex = index;
    this.storyElapsedMs = 0;
    this.resetStoryScroll();

    this.cdr.markForCheck();
    this.startReviewTimer();
  }

  toggleReviewPlayback(): void {
    this.isReviewPaused = !this.isReviewPaused;

    if (this.isReviewPaused) {
      this.stopReviewTimer();
    } else {
      this.startReviewTimer();
    }
  }

  onStoryPointerDown(event: PointerEvent): void {
    if (
        event.pointerType === 'mouse' &&
        event.button !== 0
    ) return;

    if (
        event.target instanceof Element &&
        event.target.closest('button')
    ) return;

    this.activeStoryPress = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now()
    };

    this.isStoryHeld = true;
    this.stopReviewTimer();
  }

  onStoryPointerUp(event: PointerEvent): void {
    const press = this.activeStoryPress;

    if (!press || press.pointerId !== event.pointerId) return;

    const duration = Date.now() - press.timestamp;
    const moved = Math.hypot(
        event.clientX - press.x,
        event.clientY - press.y
    );

    this.activeStoryPress = null;
    this.isStoryHeld = false;

    if (duration < 260 && moved < 16) {
      const rect =
          (event.currentTarget as HTMLElement)
              .getBoundingClientRect();

      if (event.clientX < rect.left + rect.width * 0.35) {
        this.previousReview();
      } else {
        this.nextReview();
      }
    } else {
      this.startReviewTimer();
    }
  }

  onStoryPointerCancel(event: PointerEvent): void {
    if (
        this.activeStoryPress?.pointerId !== event.pointerId
    ) return;

    this.activeStoryPress = null;
    this.isStoryHeld = false;
    this.startReviewTimer();
  }

  onStoryPointerLeave(event: PointerEvent): void {
    if (event.pointerType === 'mouse') {
      this.onStoryPointerCancel(event);
    }
  }

  onStoryContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  onStoryKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.previousReview();
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      this.nextReview();
      event.preventDefault();
    } else if (event.key === ' ') {
      this.toggleReviewPlayback();
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.stopReviewTimer();
    this.routeSubscription.unsubscribe();
  }
}
