import TokenType from "./TokenType.js";
import Token from "./Token.js";
import keywords from "./Keywords.js";

class Scanner {
  constructor(source) {
    this.source = source;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  match(expected) {
  if (this.isAtEnd()) return false;
  if (this.source[this.current] !== expected) return false;
  this.current++;
  return true;
}

peek() {
  return this.isAtEnd() ? '\0' : this.source[this.current];
}

peekNext() {
  if (this.current + 1 >= this.source.length) return '\0';
  return this.source[this.current + 1];
}

isDigit(c) {
  return c >= '0' && c <= '9';
}

isAlpha(c) {
  return (c >= 'a' && c <= 'z') ||
         (c >= 'A' && c <= 'Z') ||
         c === '_';
}

isAlphaNumeric(c) {
  return this.isAlpha(c) || this.isDigit(c);
}


  scanToken() {
  const c = this.advance();
  switch (c) {
    // Símbolos simples
    case '(': this.addToken(TokenType.LEFT_PAREN); break;
    case ')': this.addToken(TokenType.RIGHT_PAREN); break;
    case '{': this.addToken(TokenType.LEFT_BRACE); break;
    case '}': this.addToken(TokenType.RIGHT_BRACE); break;
    case ',': this.addToken(TokenType.COMMA); break;
    case '.': this.addToken(TokenType.DOT); break;
    case '-': this.addToken(TokenType.MINUS); break;
    case '+': this.addToken(TokenType.PLUS); break;
    case ';': this.addToken(TokenType.SEMICOLON); break;
    case '*': this.addToken(TokenType.STAR); break;

    // Operadores com dois caracteres possíveis
    case '!': this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
    case '=': this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
    case '<': this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
    case '>': this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;

    // Barra ou comentário
    case '/':
      if (this.match('/')) {
        while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
      } else {
        this.addToken(TokenType.SLASH);
      }
      break;

    // Espaços em branco
    case ' ':
    case '\r':
    case '\t':
      break;

    // Nova linha
    case '\n':
      this.line++;
      break;

    // Strings
    case '"': this.string(); break;

    // Literais e identificadores
    default:
      if (this.isDigit(c)) {
        this.number();
      } else if (this.isAlpha(c)) {
        this.identifier();
      } else {
        console.error(`Linha ${this.line}: Caractere inesperado '${c}'.`);
      }
      break;
  }
}

string() {
  while (this.peek() !== '"' && !this.isAtEnd()) {
    if (this.peek() === '\n') this.line++;
    this.advance();
  }

  if (this.isAtEnd()) {
    console.error(`Linha ${this.line}: String não terminada.`);
    return;
  }

  // Fechar as aspas
  this.advance();

  const value = this.source.substring(this.start + 1, this.current - 1);
  this.addToken(TokenType.STRING, value);
}

number() {
  while (this.isDigit(this.peek())) this.advance();

  // Ponto decimal
  if (this.peek() === '.' && this.isDigit(this.peekNext())) {
    this.advance(); // Consome o ponto

    while (this.isDigit(this.peek())) this.advance();
  }

  const value = parseFloat(this.source.substring(this.start, this.current));
  this.addToken(TokenType.NUMBER, value);
}

identifier() {
  while (this.isAlphaNumeric(this.peek())) this.advance();

  const text = this.source.substring(this.start, this.current);
  const type = TokenType[keywords[text]] || TokenType.IDENTIFIER;
  this.addToken(type);
}


  advance() {
    return this.source[this.current++];
  }

  addToken(type, literal = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }
}

export default Scanner;
