export function say(msg: string) {
  const ssu = new SpeechSynthesisUtterance();
  ssu.text = msg;
  ssu.lang = 'zh-CN';
  ssu.rate = 1; 
  ssu.volume = 1; 
  ssu.pitch = 1; 
  speechSynthesis.speak(ssu);
}