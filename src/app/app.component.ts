
import { Component } from '@angular/core';

type Tab = 'home' | 'about' | 'universities' | 'pricing' | 'reviews' | 'contact';

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
    { id: 'pricing', name: 'Послуги' },
    { id: 'reviews', name: 'Відгуки' },
    { id: 'contact', name: 'Контакти' }
  ];

  changeTab(tab: Tab): void {
    this.activeTab = tab;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  universities = [
    {
      name: 'Technická univerzita v Košiciach',
      city: 'Кошице',
      image: 'assets/university-9094.png'
    },
    {
      name: 'Univerzita Pavla Jozefa Šafárika v Košiciach',
      city: 'Кошице',
      image: 'assets/university-9173.png'
    },
    {
      name: 'Žilinská univerzita v Žiline',
      city: 'Жиліна',
      image: 'assets/university-9171.png'
    },
    {
      name: 'Univerzita veterinárskeho lekárstva a farmácie v Košiciach',
      city: 'Кошице',
      image: 'assets/university-9177.png'
    },
    {
      name: 'Slovenská technická univerzita v Bratislave',
      city: 'Братислава',
      image: 'assets/university-9175.png'
    },
    {
      name: 'Univerzita Komenského v Bratislave',
      city: 'Братислава',
      image: 'assets/university-9179.png'
    },
    {
      name: 'Ekonomická univerzita v Bratislave',
      city: 'Братислава',
      image: 'assets/university-9167.png'
    }
  ];

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
      description: 'Гуртожиток, документи для візи D та інші послуги залежно від пакета.'
    }
  ];

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
}
