
import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
    ChangeDetectorRef,
    signal
} from '@angular/core';

import { FormsModule } from '@angular/forms';

type LeadSource = 'home' | 'contact' | 'quiz';
type Language = 'uk' | 'ru';

interface LeadFormData {
    name: string;
    email: string;
    phone: string;
    packageName: string;
    message: string;
    website: string;
    acceptedPrivacy: boolean;
}

@Component({
    selector: 'app-lead-form',
    standalone: true,
    imports: [FormsModule],

    template: `
    <form
      class="lead-form"
      #leadForm="ngForm"
      (ngSubmit)="submit()">

      <h3>
        {{ l('Залишити заявку', 'Оставить заявку') }}
      </h3>

      <p class="form-description">
        {{ l(
          'Заповни форму — і менеджер NewGen Study зв’яжеться з тобою.',
          'Заполни форму — и менеджер NewGen Study свяжется с тобой.'
        ) }}
      </p>

      <!-- NAME -->

      <label for="lead-name-{{ source }}">
        {{ l('Ім’я', 'Имя') }} *
      </label>

      <input
        id="lead-name-{{ source }}"
        type="text"
        name="name"
        autocomplete="name"
        maxlength="100"
        minlength="2"
        required
        [(ngModel)]="data.name"
        [placeholder]="l('Твоє ім’я', 'Твоё имя')">

      <!-- EMAIL -->

      <label for="lead-email-{{ source }}">
        Email *
      </label>

      <input
        id="lead-email-{{ source }}"
        type="email"
        name="email"
        autocomplete="email"
        maxlength="254"
        required
        email
        [(ngModel)]="data.email"
        placeholder="example@gmail.com">

      <!-- PHONE -->

      <label for="lead-phone-{{ source }}">
        {{ l('Номер телефону', 'Номер телефона') }}
      </label>

      <input
        id="lead-phone-{{ source }}"
        type="tel"
        name="phone"
        autocomplete="tel"
        maxlength="40"
        [(ngModel)]="data.phone"
        placeholder="+380...">

      <!-- PACKAGE -->

      @if (source !== 'quiz') {

        <label for="lead-package-{{ source }}">
          {{ l('Послуга або пакет', 'Услуга или пакет') }}
        </label>

        <select
          id="lead-package-{{ source }}"
          name="packageName"
          [(ngModel)]="data.packageName">

          <option value="">
            {{ l('Потрібна консультація', 'Нужна консультация') }}
          </option>

          <option value="Економ">
            {{ l('Економ — 890 €', 'Эконом — 890 €') }}
          </option>

          <option value="Комфорт">
            {{ l('Комфорт — 1190 €', 'Комфорт — 1190 €') }}
          </option>

          <option value="Преміум">
            {{ l('Преміум — 1290 €', 'Премиум — 1290 €') }}
          </option>

        </select>
      }

      <!-- QUIZ RESULTS -->

      @if (quizDetails) {

        <div class="quiz-summary">

          <strong>
            {{ l('Твій підбір', 'Твой подбор') }}
          </strong>

          <textarea
            readonly
            [value]="quizDetails"
            [attr.aria-label]="l(
              'Результати підбору',
              'Результаты подбора'
            )">
          </textarea>

          <span>
            {{ l(
              'Ці відповіді будуть додані до заявки.',
              'Эти ответы будут добавлены к заявке.'
            ) }}
          </span>

        </div>
      }

      <!-- MESSAGE -->

      <label for="lead-message-{{ source }}">
        {{ l('Коментар', 'Комментарий') }}
      </label>

      <textarea
        id="lead-message-{{ source }}"
        name="message"
        rows="4"
        maxlength="2000"
        [(ngModel)]="data.message"
        [placeholder]="l(
          'Напиши своє запитання або побажання...',
          'Напиши свой вопрос или пожелание...'
        )">
      </textarea>

      <!-- SPAM PROTECTION -->

      <div class="honeypot" aria-hidden="true">

        <label for="lead-website-{{ source }}">
          Website
        </label>

        <input
          id="lead-website-{{ source }}"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
          [(ngModel)]="data.website">

      </div>

      <!-- PRIVACY -->

      <label class="privacy-label">

        <input
          type="checkbox"
          name="acceptedPrivacy"
          required
          [(ngModel)]="data.acceptedPrivacy">

        <span>
          {{ l(
            'Погоджуюсь на обробку зазначених даних для отримання відповіді на мою заявку.',
            'Соглашаюсь на обработку указанных данных для получения ответа на мою заявку.'
          ) }}
        </span>

      </label>

      <!-- SUBMIT BUTTON -->

      <button
        type="submit"
        class="submit-button"
        [disabled]="sending() || leadForm.invalid === true">

        @if (sending()) {

          <span class="spinner"></span>

          {{ l('Надсилання...', 'Отправка...') }}

        } @else {

          {{ l('Надіслати заявку', 'Отправить заявку') }}

        }

      </button>

      <!-- SUCCESS -->

      @if (success()) {

        <div
          class="form-status success"
          role="status">

          <i class="bi bi-check-circle-fill"></i>

          {{ l(
            'Дякуємо! Твою заявку успішно надіслано. Ми зв’яжемося з тобою!',
            'Спасибо! Твоя заявка успешно отправлена. Мы свяжемся с тобой!'
          ) }}

        </div>

      }

      <!-- ERROR -->

      @if (errorMessage()) {

        <div
          class="form-status error"
          role="alert">

          <i class="bi bi-exclamation-circle-fill"></i>

          {{ errorMessage() }}

        </div>

      }

    </form>
  `,

    styles: [`

    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }

    .lead-form {
      position: relative;

      display: flex;
      flex-direction: column;

      width: 100%;
      padding: 35px;

      color: #ffffff;
      background: #10283e;

      border: 1px solid #294458;
      border-radius: 14px;

      font-family: 'DM Sans', Arial, sans-serif;
    }

    .lead-form * {
      box-sizing: border-box;
    }

    .lead-form h3 {
      margin: 0 0 10px;

      font-family: 'Manrope', Arial, sans-serif;
      font-size: 24px;
      font-weight: 800;
    }

    .form-description {
      margin: 0 0 26px;

      color: #d4e3f1;
      font-size: 14px;
      line-height: 1.75;
    }

    .lead-form > label:not(.privacy-label) {
      margin: 0 0 8px;

      color: #d4e3f1;
      font-size: 13px;
      font-weight: 700;
    }

    .lead-form > input,
    .lead-form > select,
    .lead-form > textarea {
      display: block;

      width: 100%;
      min-width: 0;
      min-height: 52px;

      margin: 0 0 19px;
      padding: 13px 15px;

      color: #ffffff;
      background: #193b52;

      border: 1px solid #294458;
      border-radius: 9px;

      font: inherit;
      font-size: 14px;

      outline: none;

      transition: border-color 0.2s;
    }

    .lead-form > textarea {
      min-height: 115px;
      resize: vertical;
    }

    .lead-form input::placeholder,
    .lead-form textarea::placeholder {
      color: #a5bdd2;
    }

    .lead-form input:focus,
    .lead-form select:focus,
    .lead-form textarea:focus {
      border-color: #f1c76a;
    }

    .lead-form select option {
      color: #ffffff;
      background: #10283e;
    }

    .privacy-label {
      display: flex;
      align-items: flex-start;

      gap: 11px;
      margin: 2px 0 24px;

      color: #d4e3f1;

      font-size: 12px;
      line-height: 1.7;

      cursor: pointer;
    }

    .privacy-label input {
      width: 18px;
      height: 18px;

      margin: 2px 0 0;

      flex-shrink: 0;
      accent-color: #f1c76a;
    }

    .submit-button {
      display: flex;
      align-items: center;
      justify-content: center;

      gap: 10px;
      min-height: 54px;

      padding: 14px 24px;

      color: #07182b;
      background: #f1c76a;

      border: 1px solid #f1c76a;
      border-radius: 9px;

      font: inherit;
      font-size: 14px;
      font-weight: 800;

      cursor: pointer;

      transition:
        background 0.2s,
        opacity 0.2s;
    }

    .submit-button:hover:not(:disabled) {
      background: #ffdc91;
    }

    .submit-button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .form-status {
      display: flex;
      align-items: flex-start;

      gap: 11px;

      margin-top: 17px;
      padding: 16px;

      border-radius: 9px;

      font-size: 13px;
      line-height: 1.7;
    }

    .form-status i {
      flex-shrink: 0;
      font-size: 18px;
    }

    .form-status.success {
      color: #ddfce8;
      background: #164d3a;

      border: 1px solid #367858;
    }

    .form-status.error {
      color: #ffe2df;
      background: #59292b;

      border: 1px solid #a84a4e;
    }

    .honeypot {
      position: absolute;

      left: -10000px;

      width: 1px;
      height: 1px;

      overflow: hidden;
    }

    .quiz-summary {
      margin-bottom: 22px;
      padding: 16px;

      background: #193b52;

      border: 1px solid rgba(241, 199, 106, 0.38);
      border-radius: 10px;
    }

    .quiz-summary strong {
      display: block;

      margin-bottom: 10px;

      color: #f1c76a;
      font-size: 14px;
    }

    .quiz-summary textarea {
      display: block;

      width: 100%;
      min-height: 190px;

      padding: 12px;

      color: #ffffff;
      background: #10283e;

      border: 1px solid #294458;
      border-radius: 7px;

      resize: vertical;

      font: inherit;
      font-size: 12px;
      line-height: 1.6;
    }

    .quiz-summary span {
      display: block;

      margin-top: 10px;

      color: #a5bdd2;
      font-size: 12px;
    }

    .spinner {
      width: 17px;
      height: 17px;

      border: 2px solid #07182b;
      border-top-color: transparent;
      border-radius: 50%;

      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 600px) {
      .lead-form {
        padding: 23px;
      }

      .lead-form h3 {
        font-size: 21px;
      }
    }

  `]
})
export class LeadFormComponent implements OnChanges {

    // ======================================
    // INPUTS
    // ======================================

    @Input() source: LeadSource = 'contact';
    @Input() language: Language = 'uk';
    @Input() packageName = '';
    @Input() quizDetails = '';

    // ======================================
    // FORM DATA
    // ======================================

    data: LeadFormData = this.emptyForm();

    // Signals automatically update the UI,
    // including in Angular Zoneless mode.

    sending = signal(false);
    success = signal(false);
    errorMessage = signal('');

    constructor(
        private readonly cdr: ChangeDetectorRef
    ) {}

    private emptyForm(): LeadFormData {
        return {
            name: '',
            email: '',
            phone: '',
            packageName: '',
            message: '',
            website: '',
            acceptedPrivacy: false
        };
    }

    // ======================================
    // INPUT CHANGES
    // ======================================

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['packageName']) {
            this.data.packageName = this.packageName;
        }

        this.cdr.markForCheck();
    }

    // ======================================
    // TRANSLATIONS
    // ======================================

    l(uk: string, ru: string): string {
        return this.language === 'uk' ? uk : ru;
    }

    // ======================================
    // SEND EMAIL
    // ======================================

    async submit(): Promise<void> {

        // Prevent multiple submissions.
        if (this.sending()) {
            return;
        }

        // Clear previous messages.
        this.success.set(false);
        this.errorMessage.set('');

        const name = this.data.name.trim();
        const email = this.data.email.trim();

        // Validate required fields.
        if (
            name.length < 2 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !this.data.acceptedPrivacy
        ) {
            this.errorMessage.set(
                this.l(
                    'Перевір правильність заповнених полів.',
                    'Проверь правильность заполненных полей.'
                )
            );

            return;
        }

        // Activate loading state.
        this.sending.set(true);
        this.cdr.markForCheck();

        // Stop waiting after 20 seconds.
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 20000);

        try {

            // Send the form to Cloudflare Worker.
            const response = await fetch('/api/lead', {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                signal: controller.signal,

                body: JSON.stringify({
                    source: this.source,
                    name,
                    email,
                    phone: this.data.phone.trim(),
                    packageName: this.data.packageName,
                    message: this.data.message.trim(),
                    website: this.data.website,
                    acceptedPrivacy: this.data.acceptedPrivacy,
                    quizDetails: this.quizDetails
                })
            });

            // Read server response.
            const result: {
                ok?: boolean;
                error?: string;
            } = await response.json();

            if (!response.ok || !result.ok) {
                throw new Error(
                    result.error || `HTTP ${response.status}`
                );
            }

            // ==================================
            // SUCCESS
            // ==================================

            console.log(
                'NewGen Study: application accepted by email service.'
            );

            this.success.set(true);
            this.errorMessage.set('');

            // Clear the form after success.
            this.data = this.emptyForm();

            // Preserve the selected package.
            this.data.packageName = this.packageName;

            this.cdr.markForCheck();

        } catch (error) {

            // ==================================
            // ERROR
            // ==================================

            console.error(
                'NewGen Study email sending error:',
                error
            );

            if (
                error instanceof Error &&
                error.name === 'AbortError'
            ) {

                this.errorMessage.set(
                    this.l(
                        'Сервер довго не відповідає. Заявка могла бути надіслана — перевір пошту перед повторною спробою.',
                        'Сервер долго не отвечает. Заявка могла быть отправлена — проверь почту перед повторной попыткой.'
                    )
                );

            } else {

                this.errorMessage.set(
                    this.l(
                        'Не вдалося підтвердити надсилання заявки. Спробуй ще раз або зв’яжися з нами через соціальні мережі.',
                        'Не удалось подтвердить отправку заявки. Попробуй ещё раз или свяжись с нами через социальные сети.'
                    )
                );

            }

            this.success.set(false);
            this.cdr.markForCheck();

        } finally {
            clearTimeout(timeout);

            this.sending.set(false);

            this.cdr.detectChanges();

            console.log('Form finished. Sending:', this.sending());
        }
    }
}
