import 'package:flutter/material.dart';
import 'second_screen.dart';
import '../widgets/app_button.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  void _onButtonPressed(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => SecondScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar( 
        
        title: Text('تطبيق الشعار'),
      ),
      body: Center(
       
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Container(
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
              children: <Widget>[
                Image.asset('assets/logo.png', width: 150, height: 150),
                SizedBox(height: 30),
                AppButton(
                  onPressed: () => _onButtonPressed(context),
                  padding: EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                  textStyle: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  child: Text('اضغط هنا للانتقال إلى الأسئلة'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
