#include <iostream>
#include <cstdlib>
#include <ctime>

using namespace std;

int main() {
    srand(time(0));  // Seed random number generator
    int secretNumber = rand() % 10 + 1;  // Random number between 1 and 10
    int guess;

    cout << "Guess a number between 1 and 10: ";
    cin >> guess;

    if (guess == secretNumber) {
        cout << "🎉 Correct! You guessed it right!" << endl;
    } else {
        cout << "❌ Wrong! The correct number was " << secretNumber << endl;
    }

    return 0;
}