# Planowanie Treningów Sportowych

Aplikacja do planowania treningów sportowych w wybranym okresie. Użytkownicy mogą dodawać, edytować i usuwać zaplanowane treningi, a także przeglądać je w formie listy lub kalendarza. Projekt umożliwia pełne zarządzanie planem treningowym, w tym walidację danych oraz sortowanie po różnych kryteriach.

## Funkcjonalności

1. **Dodawanie nowych treningów**
    - Umożliwienie użytkownikom dodawania nowych treningów do swojego planu. 
    - Formularz z polami: typ treningu, data, czas trwania, opis.
    
2. **Edycja treningów**
    - Umożliwienie edytowania wcześniej wprowadzonych treningów. 
    - Edycja powinna obejmować zmianę wszystkich danych: daty, typu, czasu trwania, intensywności i opisu.
    
3. **Usuwanie treningów**
    - Umożliwienie usuwania zaplanowanych treningów. 
    - Potwierdzenie przed usunięciem. 

4. **Przeglądanie zaplanowanych treningów**  
    - Wyświetlanie wszystkich zaplanowanych treningów w formie listy lub kalendarza. 

5. **Sortowanie**  
    - Sortowanie treningów np. po typie (np. "Bieganie", "Siłownia"). 

6. **Walidacja danych**  
    - Sprawdzanie poprawności wprowadzonych danych, np. data nie może być przeszła, czas trwania nie może być zerowy. 

## Struktura Klas

### **Workout**

- **id**: number – Unikalny identyfikator treningu.
- **date**: Date – Data i czas treningu.
- **trainingType**: enum – Typ treningu (np. "Bieganie", "Siłownia").
- **duration**: number – Czas trwania treningu w minutach.
- **intensity**: number – Intensywność treningu (np. skala 1-10).
- **description**: string – Opis treningu.

### **TrainingPlan**

- **id**: number – Unikalny identyfikator planu treningowego.
- **name**: string – Nazwa planu treningowego.
- **startDate**: date – Data rozpoczęcia planu.
- **endDate**: date – Data zakończenia planu.
- **workouts**: Array<Workout> – Tablica zawierająca treningi w ramach planu.
