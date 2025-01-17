import 'package:flutter/material.dart';

class SecondScreen extends StatefulWidget {
  @override
  _SecondScreenState createState() => _SecondScreenState();
}

class _SecondScreenState extends State<SecondScreen> {
  final List<Map<String, dynamic>> questions = [
    {"question": "Welche Konjunktion passt? 'Ich gehe joggen, ... es regnet.'", "answers": ["obwohl", "weil", "wenn", "damit"], "correctAnswer": 0},
    {"question": "Welche Präposition ist richtig? 'Ich warte ... den Bus.'", "answers": ["auf", "für", "mit", "nach"], "correctAnswer": 0},
    {"question": "Wie bildet man das Perfekt? 'Ich ... nach Hause gegangen.'", "answers": ["habe", "bin", "war", "werde"], "correctAnswer": 1},
    {"question": "Welches Verb ist trennbar? 'Er ... die Tür ...'", "answers": ["schließt zu", "kommt zurück", "hört zu", "alle"], "correctAnswer": 3},
    {"question": "Was ist ein Relativsatz? 'Das Buch, ... ich lese, ist spannend.'", "answers": ["das", "der", "die", "dessen"], "correctAnswer": 0},
    // Add up to 25 questions similarly
  ];

  int currentQuestionIndex = 0;
  int correctAnswersCount = 0;
  bool showResult = false;

  void _selectAnswer(int index) {
    setState(() {
      if (index == questions[currentQuestionIndex]['correctAnswer']) {
        correctAnswersCount++;
      }
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
      } else {
        showResult = true;
      }
    });
  }

  void _resetQuiz() {
    setState(() {
      currentQuestionIndex = 0;
      correctAnswersCount = 0;
      showResult = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Deutsch B1 Quiz'),
      ),
      body: Center(
        child: showResult
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Ergebnis: $correctAnswersCount von ${questions.length}',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _resetQuiz,
                    child: Text('Quiz erneut starten'),
                  ),
                ],
              )
            : Padding(
                padding: const EdgeInsets.all(16.0),
                child: Container(
                  width: 600,
                  height: 500,
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 8,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        questions[currentQuestionIndex]["question"]!,
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 20),
                      Column(
                        children: List.generate(
                          questions[currentQuestionIndex]["answers"].length,
                          (index) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8.0),
                            child: ElevatedButton(
                              onPressed: () => _selectAnswer(index),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue,
                                foregroundColor: Colors.white,
                              ),
                              child: Text(questions[currentQuestionIndex]["answers"][index]),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }
}
