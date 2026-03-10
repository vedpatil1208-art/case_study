#include <iostream>      // For input and output
#include <vector>        // For using dynamic arrays (vector)
#include <fstream>       // For file handling
#include <stdexcept>     // For exception handling
using namespace std;

// ================= PERSON CLASS =================
// Base abstract class representing a general person
class Person {
protected:
    int id;         // Unique ID for person
    string name;    // Name of the person

public:
    // Constructor to initialize ID and name
    Person(int id, string name) {
        this->id = id;
        this->name = name;
    }

    // Getter function to return the ID
    int getId() const { return id; }

    // Pure virtual function (forces derived classes to implement display)
    virtual void display() const = 0;
};

// ================= DOCTOR CLASS =================
// Derived class from Person representing a doctor
class Doctor : public Person {
private:
    string specialization;   // Doctor's specialization field

public:
    // Constructor initializes base class and specialization
    Doctor(int id, string name, string specialization)
        : Person(id, name), specialization(specialization) {}

    // Function to display doctor information
    void display() const override {
        cout << "Doctor ID: " << id
             << " | Name: " << name
             << " | Specialization: " << specialization << endl;
    }
};

// ================= PATIENT CLASS =================
// Derived class representing a patient
class Patient : public Person {
private:
    int age;   // Age of patient

public:
    // Constructor initializes base class and age
    Patient(int id, string name, int age)
        : Person(id, name), age(age) {}

    // Function to display patient information
    void display() const override {
        cout << "Patient ID: " << id
             << " | Name: " << name
             << " | Age: " << age << endl;
    }
};

// ================= APPOINTMENT CLASS =================
// Class representing a consultation/appointment record
class Appointment {
private:
    int doctorId;      // ID of doctor
    int patientId;     // ID of patient
    string date;       // Consultation date
    string symptoms;   // Symptoms described by patient
    string diagnosis;  // Doctor's diagnosis
    string status;     // Treatment status

public:
    // Constructor initializes all appointment details
    Appointment(int dId, int pId, string date,
                string symptoms, string diagnosis, string status)
        : doctorId(dId), patientId(pId),
          date(date), symptoms(symptoms),
          diagnosis(diagnosis), status(status) {}

    // Function to save consultation details to file
    void saveToFile() {
        ofstream file("records.txt", ios::app);  // Open file in append mode

        // If file fails to open, throw error
        if (!file)
            throw runtime_error("Error opening records.txt");

        // Writing appointment details to file
        file << "Doctor ID: " << doctorId
             << " | Patient ID: " << patientId
             << " | Date: " << date
             << " | Symptoms: " << symptoms
             << " | Diagnosis: " << diagnosis
             << " | Status: " << status << endl;

        file.close();  // Close file
    }
};

// ================= HELPER FUNCTIONS =================

// Function to check if a doctor ID already exists
bool doctorExists(const vector<Doctor>& doctors, int id) {
    for (const auto& d : doctors)
        if (d.getId() == id)
            return true;
    return false;
}

// Function to check if a patient ID already exists
bool patientExists(const vector<Patient>& patients, int id) {
    for (const auto& p : patients)
        if (p.getId() == id)
            return true;
    return false;
}

// ================= MAIN FUNCTION =================
int main() {

    vector<Doctor> doctors;     // Vector storing registered doctors
    vector<Patient> patients;   // Vector storing registered patients

    int choice; // Menu choice

    // INFORMATION MESSAGE
    cout << "-----------------------------------------------------\n";
    cout << "        TELEMEDICINE BACKEND SYSTEM\n";
    cout << "-----------------------------------------------------\n";
    cout << "All consultation data is stored permanently in\n";
    cout << "records.txt using C++ file handling.\n";
    cout << "-----------------------------------------------------\n";

    // Loop runs until user chooses Exit
    do {

        // Display menu
        cout << "\nMenu:\n";
        cout << "1. Register Doctor\n";
        cout << "2. Register Patient\n";
        cout << "3. Schedule Consultation\n";
        cout << "4. Exit\n";
        cout << "Enter choice: ";

        cin >> choice;

        try {

            // ================= REGISTER DOCTOR =================
            if (choice == 1) {

                int id;
                string name, specialization;

                cout << "Enter Doctor ID: ";
                cin >> id;

                // Check for duplicate doctor ID
                if (doctorExists(doctors, id))
                    throw invalid_argument("Doctor ID already exists!");

                cout << "Enter Name: ";
                cin >> name;

                cout << "Enter Specialization: ";
                cin >> specialization;

                // Add doctor to vector
                doctors.push_back(Doctor(id, name, specialization));

                cout << "Doctor Registered Successfully!\n";
            }

            // ================= REGISTER PATIENT =================
            else if (choice == 2) {

                int id, age;
                string name;

                cout << "Enter Patient ID: ";
                cin >> id;

                // Check duplicate patient ID
                if (patientExists(patients, id))
                    throw invalid_argument("Patient ID already exists!");

                cout << "Enter Name: ";
                cin >> name;

                cout << "Enter Age: ";
                cin >> age;

                // Add patient to vector
                patients.push_back(Patient(id, name, age));

                cout << "Patient Registered Successfully!\n";
            }

            // ================= SCHEDULE CONSULTATION =================
            else if (choice == 3) {

                int dId, pId;
                string date, symptoms, diagnosis, status;

                cout << "Enter Doctor ID: ";
                cin >> dId;

                // Validate doctor existence
                if (!doctorExists(doctors, dId))
                    throw invalid_argument("Doctor ID not found!");

                cout << "Enter Patient ID: ";
                cin >> pId;

                // Validate patient existence
                if (!patientExists(patients, pId))
                    throw invalid_argument("Patient ID not found!");

                cout << "Enter Date: ";
                cin >> date;

                cin.ignore(); // Clear input buffer

                cout << "Enter Symptoms: ";
                getline(cin, symptoms);

                cout << "Enter Diagnosis: ";
                getline(cin, diagnosis);

                cout << "Enter Status (Recovered / Under Treatment): ";
                getline(cin, status);

                // Create appointment object
                Appointment app(dId, pId, date, symptoms, diagnosis, status);

                // Save appointment to file
                app.saveToFile();

                cout << "Consultation saved successfully in records.txt!\n";
            }

            // ================= EXIT PROGRAM =================
            else if (choice == 4) {

                cout << "Exiting System...\n";
            }

            // ================= INVALID CHOICE =================
            else {

                throw invalid_argument("Invalid choice!");
            }
        }

        // Exception handling
        catch (exception &e) {

            cout << "Error: " << e.what() << endl;
        }

    } while (choice != 4); // Continue until user exits

    return 0;
}
