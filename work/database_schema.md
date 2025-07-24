# توثيق قاعدة البيانات المدمجة (Mock Data)

يستخدم هذا المشروع حاليًا قاعدة بيانات مدمجة (mock data) لمحاكاة بيئة عمل حقيقية. يتم تعريف البيانات في ملف `src/lib/data.ts` وتُدار حالتها عبر React Context API في `src/components/app-provider.tsx`.

---

## 1. بنية البيانات (Data Schemas)

يتم تعريف أنواع البيانات (interfaces) في ملف `src/lib/types.ts`.

### أ. المرضى (Patient)

يمثل سجل المريض وكل معلوماته الأساسية والعلاجية.

| الحقل | النوع | الوصف |
| :--- | :--- | :--- |
| `_id` | `string` | معرف فريد للمريض. |
| `patientName` | `string` | اسم المريض الكامل. |
| `patientId` | `string` | الرقم التعريفي للمريض (يظهر في الواجهات). |
| `dateOfBirth` | `string` | تاريخ ميلاد المريض. |
| `phone` | `string` | رقم هاتف المريض. |
| `email` | `string` | البريد الإلكتروني للمريض. |
| `address` | `string` | عنوان سكن المريض. |
| `startDate` | `string` | تاريخ بدء العلاج. |
| `currentStatus` | `'Active Treatment' \| 'Final Phase' \| 'Retention Phase'` | حالة العلاج الحالية. |
| `totalSessions` | `number` | إجمالي عدد الجلسات المخطط لها. |
| `completedSessions`| `number` | عدد الجلسات التي تم إكمالها. |
| `remainingSessions`| `number` | عدد الجلسات المتبقية. |
| `chiefComplaint` | `string` | الشكوى الرئيسية التي جاء بها المريض. |
| `notes` | `string` | ملاحظات الطبيب حول حالة المريض. |
| `avatarUrl` | `string` | رابط الصورة الرمزية للمريض. |
| `outstandingBalance`| `number` | الرصيد المالي المستحق على المريض. |

### ب. المواعيد (Appointment)

يمثل موعد المريض في قائمة الانتظار وحالته.

| الحقل | النوع | الوصف |
| :--- | :--- | :--- |
| `_id` | `string` | معرف فريد للموعد. |
| `patientId` | `string` | المعرف الفريد للمريض المرتبط بالموعد. |
| `status` | `'Waiting' \| 'InRoom' \| 'Completed' \| 'Canceled'` | حالة الموعد الحالية. |
| `queueTime` | `string` | وقت دخول المريض إلى قائمة الانتظار. |
| `assignedRoomNumber`| `number` (optional) | رقم الغرفة التي تم توجيه المريض إليها. |
| `calledTime` | `string` (optional) | وقت استدعاء المريض. |
| `completedTime`| `string` (optional) | وقت اكتمال الجلسة. |

### ج. المعاملات المالية (Transaction)

يمثل معاملة مالية (دفعة أو رسوم) مرتبطة بمريض.

| الحقل | النوع | الوصف |
| :--- | :--- | :--- |
| `_id` | `string` | معرف فريد للمعاملة. |
| `patientId` | `string` | المعرف الفريد للمريض المرتبط بالمعاملة. |
| `patientName` | `string` | اسم المريض (لتسهيل العرض). |
| `date` | `string` | تاريخ المعاملة. |
| `description` | `string` | وصف للمعاملة (مثل "دفعة شهرية"). |
| `amount` | `number` | مبلغ المعاملة. |
| `type` | `'Payment' \| 'Charge'` | نوع المعاملة (دفعة من المريض أو رسوم من العيادة). |
| `status` | `'Paid' \| 'Pending'` | حالة المعاملة (مدفوعة أو معلقة). |

---

## 2. إدارة الحالة (State Management)

يتم توفير البيانات وإدارتها مركزيًا عبر `AppProvider` باستخدام React Context API.

- **المزود (`AppProvider`)**: يقوم بتحميل البيانات الأولية من `src/lib/data.ts` ويحتفظ بها في `useState`.
- **التوابع**: يوفر توابع لتحديث الحالة، مثل `updateAppointmentStatus` التي تُستخدم لتغيير حالة المريض في قائمة الانتظار.
- **المزامنة بين علامات التبويب**: لضمان تزامن شاشة الانتظار مع لوحة التحكم، يتم استخدام `localStorage` لتخزين الحالة الحالية للمواعيد والمريض المستدعى. تقوم شاشة الانتظار بمراقبة التغييرات في `localStorage` أو إعادة تحميل نفسها بشكل دوري لعرض أحدث البيانات.
