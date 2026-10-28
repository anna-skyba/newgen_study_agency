import { Component } from '@angular/core';

type Tab =
    | 'home'
    | 'about'
    | 'universities'
    | 'quiz'
    | 'pricing'
    | 'reviews'
    | 'contact';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  activeTab: Tab = 'home';

  tabs: { id: Tab; name: string }[] = [
    { id: 'home', name: 'Головна' },
    { id: 'about', name: 'Про нас' },
    { id: 'universities', name: 'Університети' },
    { id: 'quiz', name: 'Підбір' },
    { id: 'pricing', name: 'Послуги' },
    { id: 'reviews', name: 'Відгуки' },
    { id: 'contact', name: 'Контакти' }
  ];

  changeTab(tab: Tab): void {
    this.activeTab = tab;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  // UNIVERSITIES

  universities = [
    {
      name: 'Technická univerzita v Košiciach',
      city: 'Кошице',
      image: 'assets/university-9094.png',
      searchNames: 'Технічний університет Кошице TUKE технічний'
    },
    {
      name: 'Univerzita Pavla Jozefa Šafárika v Košiciach',
      city: 'Кошице',
      image: 'assets/university-9167.png',
      searchNames: 'Університет Павла Йозефа Шафарика UPJŠ УПЙШ'
    },
    {
      name: 'Žilinská univerzita v Žiline',
      city: 'Жиліна',
      image: 'assets/university-9171.png',
      searchNames: 'Жилінський університет UNIZA'
    },
    {
      name: 'Slovenská technická univerzita v Bratislave',
      city: 'Братислава',
      image: 'assets/university-9177.png',
      searchNames: 'Словацький технічний університет STU СТУ'
    },
    {
      name: 'Ekonimická univerzita v Bratislave',
      city: 'Братислава',
      image: 'assets/university-9175.png',
      searchNames: 'Економічний університет в Братиславі ЕУБА EUBA'
    },
    {
      name: 'Univerzita Komenského v Bratislave',
      city: 'Братислава',
      image: 'assets/university-9179.png',
      searchNames: 'Університет Коменського UK'
    },
    {
      name: 'Univerzita Pavla Jozefa Šafárika v Košiciach',
      city: 'Кошице',
      image: 'assets/university-9167.png',
      searchNames: 'Університет Павла Йозефа Шафарика UPJŠ УПЙШ'
    },
    {
      name: 'Univerzita veterinárneho lekárstva v Košiciach',
      city: 'Кошице',
      image: 'assets/university-9173.png',
      searchNames: 'Університет ветеринарної медицини та фармації ветеринарний UVLF'
    }
  ];


  // Пошук університетів у каталозі
  universitySearch = '';

  get filteredUniversities() {
    const query = this.normalizeSearch(this.universitySearch);

    if (!query) {
      return this.universities;
    }

    return this.universities.filter(uni => {
      const searchableText = this.normalizeSearch(
          `${uni.name} ${uni.city} ${uni.searchNames}`
      );

      return searchableText.includes(query);
    });
  }

  // Варіанти міст для підказок в анкеті
  slovakCities: string[] = [
    'Банська Бистриця',
    'Братислава',
    'Жиліна',
    'Кошице',
    'Нітра',
    'Попрад',
    'Пряшів',
    'Тренчин',
    'Трнава'
  ];

  private normalizeSearch(value: string): string {
    return value
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
  }

  updateQuizCity(value: string): void {
    this.quizAnswers['city'] = value;
  }


  // ADMISSION STEPS

  steps = [
    {
      title: 'Підбір університету',
      description: 'Підбір навчального закладу відповідно до побажань студента.'
    },
    {
      title: 'Підготовка документів',
      description: 'Переклад документів, мотиваційний лист та біографія словацькою мовою.'
    },
    {
      title: 'Подача заявок',
      description: 'Формування та подача повного пакета документів до університету.'
    },
    {
      title: 'Комунікація з університетом',
      description: 'Спілкування з університетом від імені студента.'
    },
    {
      title: 'Зарахування',
      description: 'Отримання листа про зарахування та реєстрація студентського кабінету.'
    },
    {
      title: 'Подальший супровід',
      description: 'Гуртожиток, документи для ВНЖ та інші послуги залежно від пакета.'
    }
  ];

  // SERVICES

  services = [
    'Підбір університету',
    'Переклад усіх документів (атестат, виписка оцінок тощо)',
    'Написання мотиваційного листа та біографії словацькою мовою',
    'Формування та подача повного пакета документів до університету',
    'Комунікація з університетом від імені студента',
    'Оплата студентського квитка',
    'Реєстрація на онлайн-іспити за потреби',
    'Отримання листа про зарахування, підготовка документів для візи D та їх відправка',
    'Реєстрація електронного кабінету студента',
    'Подача заяви на гуртожиток',
    'Супровід у банку для відкриття рахунку',
    'Супровід при покупці SIM-карти',
    'Супровід студента на заселення до гуртожитку',
    'Реєстрація на медичну комісію після отримання ВНЖ',
    'Підготовка документів для подачі на ВНЖ',
    'Супровід студента в поліцію для подачі документів',
    'Допомога в заповненні документів для ВНЖ',
    'Квиток на поїзд по Словаччині до вибраного міста',
    'Зустріч студента на вокзалі'
  ];

  // PRICING PACKAGES

  packages = [
    {
      name: 'Економ',
      price: 890,
      applications: 1,
      included: 11,
      featured: false
    },
    {
      name: 'Комфорт',
      price: 1190,
      applications: 2,
      included: 15,
      featured: true
    },
    {
      name: 'Преміум',
      price: 1290,
      applications: 2,
      included: 19,
      featured: false
    }
  ];

  hasService(serviceIndex: number, packageIndex: number): boolean {
    return serviceIndex < this.packages[packageIndex].included;
  }

  // UNIVERSITY SELECTION QUESTIONNAIRE

  quizQuestions = [
    {
      id: 'specialty',
      title: 'Яка твоя омріяна спеціальність?',
      options: [
        'IT та програмування',
        'Інженерія та архітектура',
        'Медицина та біологія',
        'Економіка та бізнес',
        'Гуманітарні науки',
        'Ще не визначився/визначилась'
      ]
    },
    {
      id: 'city',
      title: 'У якому місті плануєш навчатися?',
      options: [
        'Кошице',
        'Братислава',
        'Жиліна',
        'Нітра'
      ]
    },
    {
      id: 'language',
      title: 'Який твій рівень словацької мови?',
      options: [
        'A0 — не знаю словацької',
        'A1–A2 — початковий',
        'B1–B2 — середній',
        'C1–C2 — високий'
      ]
    },

    {
      id: 'exams',
      title: 'Чи готовий/готова складати вступні іспити?',
      options: [
        'Так, готовий/готова',
        'Бажано вступити без іспитів',
        'Розгляну обидва варіанти'
      ]
    }
  ];

  // Selected answers are stored only in Angular memory.

  quizAnswers: Record<string, string> = {};

  selectQuizAnswer(questionId: string, answer: string): void {
    this.quizAnswers[questionId] = answer;
  }

  isQuizSelected(questionId: string, answer: string): boolean {
    return this.quizAnswers[questionId] === answer;
  }
}
