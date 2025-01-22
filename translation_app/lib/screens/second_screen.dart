import 'dart:math'; // مكتبة العشوائية
import 'package:flutter/material.dart';

class SecondScreen extends StatefulWidget {
  @override
  _SecondScreenState createState() => _SecondScreenState();
}

class _SecondScreenState extends State<SecondScreen> {
  final List<Map<String, dynamic>> originalQuestions = [
    {
    "question": "Welche Konjunktion passt? „Ich gehe joggen, ... es regnet.“",
    "answers": ["weil", "damit", "obwohl", "wenn"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Konjunktion passt? „Ich kaufe Gemüse, ... ich koche heute Abend.“",
    "answers": ["obwohl", "damit", "weil", "aber"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Konjunktion passt? „Er fährt Fahrrad, ... er umweltfreundlich sein möchte.“",
    "answers": ["damit", "obwohl", "weil", "deshalb"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Konjunktion passt? „Ich lerne viel, ... ich gute Noten bekomme.“",
    "answers": ["weil", "wenn", "aber", "damit"],
    "correctAnswer": 3
  },
  {
    "question": "Welche Konjunktion passt? „Er arbeitet viel, ... er ist oft müde.“",
    "answers": ["obwohl", "weil", "aber", "damit"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Konjunktion passt? „Ich stehe früh auf, ... ich den Zug nicht verpasse.“",
    "answers": ["obwohl", "weil", "damit", "aber"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Konjunktion passt? „Ich bleibe zu Hause, ... ich krank bin.“",
    "answers": ["weil", "obwohl", "damit", "wenn"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Konjunktion passt? „... es regnet, gehen wir spazieren.“",
    "answers": ["Weil", "Obwohl", "Damit", "Wenn"],
    "correctAnswer": 1
  },
  {
    "question": "Welche Konjunktion passt? „... ich müde bin, gehe ich ins Bett.“",
    "answers": ["Wenn", "Weil", "Obwohl", "Damit"],
    "correctAnswer": 1
  },
  {
    "question": "Welche Konjunktion passt? „Ich rufe dich an, ... ich Zeit habe.“",
    "answers": ["weil", "wenn", "obwohl", "damit"],
    "correctAnswer": 1
  },
  {
    "question": "Welche Präposition ist richtig? „Ich warte ... den Bus.“",
    "answers": ["für", "nach", "auf", "mit"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Präposition ist richtig? „Er interessiert sich ... Geschichte.“",
    "answers": ["an", "mit", "für", "in"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Präposition ist richtig? „Ich träume ... einem schönen Urlaub.“",
    "answers": ["mit", "über", "auf", "von"],
    "correctAnswer": 3
  },
  {
    "question": "Welche Präposition ist richtig? „Ich habe Angst ... Hunden.“",
    "answers": ["bei", "an", "vor", "für"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Präposition ist richtig? „Wir fahren ... Berlin.“",
    "answers": ["von", "zu", "nach", "mit"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Präposition ist richtig? „Ich freue mich ... den Besuch.“",
    "answers": ["an", "über", "auf", "bei"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Präposition ist richtig? „Ich bedanke mich ... die Einladung.“",
    "answers": ["an", "bei", "mit", "für"],
    "correctAnswer": 3
  },
  {
    "question": "Welche Präposition ist richtig? „Ich erinnere mich ... unseren letzten Urlaub.“",
    "answers": ["bei", "mit", "an", "auf"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Präposition ist richtig? „Wir diskutieren ... das Problem.“",
    "answers": ["auf", "über", "an", "mit"],
    "correctAnswer": 1
  },
  {
    "question": "Welche Präposition ist richtig? „Er hat sich ... das Geschenk gefreut.“",
    "answers": ["bei", "über", "auf", "an"],
    "correctAnswer": 1
  },
  {
    "question": "Wie bildet man das Perfekt? „Ich ... nach Hause gegangen.“",
    "answers": ["habe", "bin", "war", "werde"],
    "correctAnswer": 1
  },
  {
    "question": "Welches Hilfsverb benutzt man? „Er ... gestern ins Kino gegangen.“",
    "answers": ["war", "ist", "hat", "wäre"],
    "correctAnswer": 1
  },
  {
    "question": "Wie bildet man das Perfekt? „Wir ... einen Film gesehen.“",
    "answers": ["haben", "sind", "werden", "hatten"],
    "correctAnswer": 0
  },
  {
    "question": "Wie bildet man das Perfekt? „Er ... schon gegessen.“",
    "answers": ["war", "hat", "wäre", "ist"],
    "correctAnswer": 1
  },
  {
    "question": "Welches Partizip ist richtig? „Wir haben ein neues Auto ...“",
    "answers": ["kaufen", "gekauft", "kaufe", "kaufend"],
    "correctAnswer": 1
  }, {
    "question": "Welche Konjunktion passt? „Ich kaufe ein Auto, ... ich meinen Führerschein habe.“",
    "answers": ["weil", "obwohl", "sobald", "damit"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Präposition ist richtig? „Wir sprechen ... den Lehrer.“",
    "answers": ["zu", "mit", "bei", "für"],
    "correctAnswer": 1
  },
  {
    "question": "Welche Konjunktion passt? „Ich gehe nach Hause, ... es zu regnen beginnt.“",
    "answers": ["bevor", "nachdem", "weil", "wenn"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Präposition ist richtig? „Ich warte ... den Bus seit einer Stunde.“",
    "answers": ["auf", "mit", "bei", "für"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Konjunktion passt? „Er fährt zur Arbeit, ... das Wetter schlecht ist.“",
    "answers": ["weil", "obwohl", "damit", "sobald"],
    "correctAnswer": 1
  },
  {
    "question": "Welche Form ist richtig? „Ich ... gestern ein Buch gelesen.“",
    "answers": ["haben", "bin", "hatte", "habe"],
    "correctAnswer": 3
  },
  {
    "question": "Welche Präposition ist richtig? „Ich habe mich ... die Prüfung vorbereitet.“",
    "answers": ["an", "für", "auf", "bei"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Konjunktion passt? „Ich brauche Ruhe, ... ich lernen kann.“",
    "answers": ["weil", "damit", "obwohl", "dass"],
    "correctAnswer": 1
  },
  {
    "question": "Welche Form ist richtig? „Er ... vor zwei Jahren nach Deutschland gezogen.“",
    "answers": ["ist", "hat", "war", "wäre"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Präposition ist richtig? „Ich fahre ... dem Fahrrad zur Schule.“",
    "answers": ["mit", "bei", "auf", "an"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Präposition ist richtig? „Wir haben ... den Urlaub gesprochen.“",
    "answers": ["über", "mit", "an", "auf"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Form ist richtig? „Wenn es morgen regnet, ... wir zu Hause bleiben.“",
    "answers": ["bleiben", "bleibt", "blieben", "werden"],
    "correctAnswer": 0
  },
  {
    "question": "Welches Wort passt? „Ich habe gestern ein Buch ...“",
    "answers": ["gelesen", "lesen", "liest", "gelesene"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Konjunktion passt? „Wir bleiben zu Hause, ... es stürmt.“",
    "answers": ["weil", "obwohl", "damit", "wenn"],
    "correctAnswer": 3
  },
  {
    "question": "Welche Präposition ist richtig? „Ich träume ... einem neuen Auto.“",
    "answers": ["bei", "von", "auf", "über"],
    "correctAnswer": 1
  },
  {
    "question": "Welche Form ist richtig? „Ich ... gestern einen Film gesehen.“",
    "answers": ["haben", "bin", "hatte", "habe"],
    "correctAnswer": 3
  },
  {
    "question": "Welche Form ist richtig? „Er ... die Aufgabe schnell gelöst.“",
    "answers": ["hat", "ist", "war", "hätte"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Präposition ist richtig? „Ich danke dir ... deine Hilfe.“",
    "answers": ["für", "an", "bei", "mit"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Präposition ist richtig? „Er fährt ... das Wochenende in die Berge.“",
    "answers": ["für", "über", "mit", "an"],
    "correctAnswer": 1
  },
  {
    "question": "Welche Präposition ist richtig? „Wir treffen uns ... der Bibliothek.“",
    "answers": ["an", "auf", "in", "bei"],
    "correctAnswer": 3
  },
  {
    "question": "Welche Konjunktion passt? „Ich habe einen Regenschirm mitgenommen, ... es regnen könnte.“",
    "answers": ["weil", "obwohl", "falls", "damit"],
    "correctAnswer": 2
  },
  {
    "question": "Welche Form ist richtig? „Wir ... gestern in der Stadt gewesen.“",
    "answers": ["sind", "haben", "waren", "hätten"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Präposition ist richtig? „Das Buch liegt ... dem Tisch.“",
    "answers": ["auf", "an", "in", "bei"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Präposition ist richtig? „Ich bin ... meiner Schwester ins Kino gegangen.“",
    "answers": ["mit", "bei", "an", "auf"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Konjunktion passt? „Ich bleibe im Bett, ... ich krank bin.“",
    "answers": ["weil", "obwohl", "damit", "falls"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Form ist richtig? „Er ... das Buch bereits gelesen.“",
    "answers": ["hat", "ist", "war", "hätte"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Präposition ist richtig? „Wir fahren ... der Schule direkt nach Hause.“",
    "answers": ["von", "aus", "bei", "mit"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Konjunktion passt? „Ich gehe ins Kino, ... ich heute Zeit habe.“",
    "answers": ["weil", "obwohl", "falls", "damit"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Präposition ist richtig? „Ich habe mich ... den Fehler geärgert.“",
    "answers": ["über", "an", "auf", "bei"],
    "correctAnswer": 0
  },
  {
    "question": "Welche Konjunktion passt? „Ich komme mit, ... ich fertig bin.“",
    "answers": ["weil", "obwohl", "falls", "sobald"],
    "correctAnswer": 3
  }
  ];

  List<Map<String, dynamic>> shuffledQuestions = [];
  int currentQuestionIndex = 0;
  int correctAnswersCount = 0;
  bool showResult = false;

  @override
  void initState() {
    super.initState();
    _initializeQuiz();
  }

  void _initializeQuiz() {
    shuffledQuestions = List<Map<String, dynamic>>.from(originalQuestions);
    shuffledQuestions.shuffle(Random());

    for (var question in shuffledQuestions) {
      List<String> answers = List<String>.from(question['answers']);
      int correctAnswerIndex = question['correctAnswer'];
      answers.shuffle(Random());
      question['answers'] = answers;
      question['correctAnswer'] = answers.indexOf(
          originalQuestions[shuffledQuestions.indexOf(question)]['answers']
              [correctAnswerIndex]);
    }

    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    showResult = false;
  }

  void _selectAnswer(int index) {
    setState(() {
      if (index == shuffledQuestions[currentQuestionIndex]['correctAnswer']) {
        correctAnswersCount++;
      }
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        currentQuestionIndex++;
      } else {
        showResult = true;
      }
    });
  }

  void _resetQuiz() {
    setState(() {
      _initializeQuiz();
    });
  }

  void _endQuiz() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Ergebnis'),
          content: Text(
            'Aktuelle Punktzahl: $correctAnswersCount von ${shuffledQuestions.length}',
            style: TextStyle(fontSize: 18),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // يغلق مربع الحوار
              },
              child: Text('Weiter'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // يغلق مربع الحوار
                Navigator.of(context).pop(); // يغلق التطبيق
              },
              child: Text('Beenden'),
            ),
          ],
        );
      },
    );
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
                  Image.asset('assets/logo.png', width: 100, height: 100),
                  SizedBox(height: 20),
                  Text(
                    'Ergebnis: $correctAnswersCount von ${shuffledQuestions.length}',
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
                  height: 650,
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
                      Image.asset('assets/logo.png', width: 100, height: 100),
                      SizedBox(height: 20),
                      Text(
                        shuffledQuestions[currentQuestionIndex]["question"]!,
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 20),
                      Column(
                        children: List.generate(
                          shuffledQuestions[currentQuestionIndex]["answers"].length,
                          (index) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8.0),
                            child: ElevatedButton(
                              onPressed: () => _selectAnswer(index),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue,
                                foregroundColor: Colors.white,
                              ),
                              child: Text(shuffledQuestions[currentQuestionIndex]["answers"][index]),
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: _endQuiz,
                        child: Text('Beenden'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(horizontal: 40, vertical: 15),
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
