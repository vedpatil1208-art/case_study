#include <iostream>
#include <vector>
#include <fstream>
#include <stdexcept>
using namespace std;

// ================= PERSON CLASS =================
class Person {
protected:
    int id;
    string name;

public:
    Person(int id, string name) {
        this->id = id;
        this->name = name;
    }

    int getId() const { return id; }

    virtual void display() const = 0;
};

// ================= DOCTOR CLASS =================
class Doctor : public Person {
private:
    string specialization;

public:
    Doctor(int id, string name, string specialization)
        : Person(id, name), specialization(specialization) {}

    string getSpecialization() const { return specialization; }

    void display() const override {
        cout << "Doctor ID: " << id
             << " | Name: " << name
             << " | Specialization: " << specialization << endl;
    }
};

// ================= PATIENT CLASS =================
class Patient : public Person {
private:
    int age;

public:
    Patient(int id, string name, int age)
        : Person(id, name), age(age) {}

    void display() const override {
        cout << "Patient ID: " << id
             << " | Name: " << name
             << " | Age: " << age << endl;
    }
};

// ================= APPOINTMENT CLASS =================
class Appointment {
private:
    int doctorId;
    int patientId;
    string date;
    string symptoms;
    string diagnosis;
    string status;

public:
    Appointment(int dId, int pId, string date,
                string symptoms, string diagnosis, string status)
        : doctorId(dId), patientId(pId),
          date(date), symptoms(symptoms),
          diagnosis(diagnosis), status(status) {}

    void saveToFile() {
        ofstream file("records.txt", ios::app);
        if (!file)
            throw runtime_error("File error!");

        file << "Doctor ID: " << doctorId
             << " | Patient ID: " << patientId
             << " | Date: " << date
             << " | Symptoms: " << symptoms
             << " | Diagnosis: " << diagnosis
             << " | Status: " << status << endl;

        file.close();
    }

    static void viewAppointments() {
        ifstream file("records.txt");
        if (!file) {
            cout << "No records found.\n";
            return;
        }

        cout << "\n--- Consultation Records ---\n";
        string line;
        while (getline(file, line)) {
            cout << line << endl;
        }
        file.close();
    }
};

// ================= HELPER FUNCTIONS =================
bool doctorExists(const vector<Doctor>& doctors, int id) {
    for (const auto& d : doctors)
        if (d.getId() == id)
            return true;
    return false;
}

bool patientExists(const vector<Patient>& patients, int id) {
    for (const auto& p : patients)
        if (p.getId() == id)
            return true;
    return false;
}

// ================= MAIN FUNCTION =================
int main() {

    vector<Doctor> doctors;
    vector<Patient> patients;
    int choice;

    do {
        cout << "\n===== Telemedicine Backend System =====\n";
        cout << "1. Register Doctor\n";
        cout << "2. Register Patient\n";
        cout << "3. Schedule Consultation\n";
        cout << "4. View Consultation Records\n";
        cout << "5. Exit\n";
        cout << "Enter choice: ";
        cin >> choice;

        try {

            // REGISTER DOCTOR
            if (choice == 1) {
                int id;
                string name, specialization;

                cout << "Enter Doctor ID: ";
                cin >> id;

                if (doctorExists(doctors, id))
                    throw invalid_argument("Doctor ID already exists!");

                cout << "Enter Name: ";
                cin >> name;
                cout << "Enter Specialization: ";
                cin >> specialization;

                doctors.push_back(Doctor(id, name, specialization));
                cout << "Doctor Registered Successfully!\n";
            }

            // REGISTER PATIENT
            else if (choice == 2) {
                int id, age;
                string name;

                cout << "Enter Patient ID: ";
                cin >> id;

                if (patientExists(patients, id))
                    throw invalid_argument("Patient ID already exists!");

                cout << "Enter Name: ";
                cin >> name;
                cout << "Enter Age: ";
                cin >> age;

                patients.push_back(Patient(id, name, age));
                cout << "Patient Registered Successfully!\n";
            }

            // SCHEDULE CONSULTATION
            else if (choice == 3) {
                int dId, pId;
                string date, symptoms, diagnosis, status;

                cout << "Enter Doctor ID: ";
                cin >> dId;
                if (!doctorExists(doctors, dId))
                    throw invalid_argument("Doctor ID not found!");

                cout << "Enter Patient ID: ";
                cin >> pId;
                if (!patientExists(patients, pId))
                    throw invalid_argument("Patient ID not found!");

                cout << "Enter Date: ";
                cin >> date;

                cin.ignore(); // clear buffer

                cout << "Enter Symptoms: ";
                getline(cin, symptoms);

                cout << "Enter Diagnosis: ";
                getline(cin, diagnosis);

                cout << "Enter Status (Recovered / Under Treatment): ";
                getline(cin, status);

                Appointment app(dId, pId, date, symptoms, diagnosis, status);
                app.saveToFile();

                cout << "Consultation Saved Successfully!\n";
            }

            // VIEW RECORDS
            else if (choice == 4) {
                Appointment::viewAppointments();
            }

            else if (choice == 5) {
                cout << "Exiting System...\n";
            }

            else {
                throw invalid_argument("Invalid choice!");
            }

        } catch (exception &e) {
            cout << "Error: " << e.what() << endl;
        }

    } while (choice != 5);

    return 0;
}