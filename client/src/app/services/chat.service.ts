import { Injectable } from '@angular/core';
import { Http, Headers} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import {Message} from '../models/message';
import {Chatroom} from '../models/chatroom';


@Injectable()
export class ChatService {
  private url = window.location.origin;
  private socket = io(this.url);
  private newChatUrl = 'http://localhost:3000/chat/new-room';
  private newPostUrl = 'http://localhost:3000/chat/send-message';

  constructor(
    private http: Http
  ) { }

  //Connects new user to the chat and updates
  connectToChat(username){
    this.socket.emit('connect to chat', username);
  }


  //Create a new message
  submitMessage(msg: Message){
    let headerTypes = new Headers();
    //Create new headers so we know what content to expect
    headerTypes.append('Content-type', 'application/json');
    return this.http.post(this.newPostUrl, msg, {headers: headerTypes})
      .map(res => res.json());
  }

  getMsgInRoom(getRoom): Observable<Message[]>{
    let observable = new Observable<Message[]>(observer => {
      this.socket.emit('current room', getRoom);
      this.socket.on('reload msgs', (msgs) => {
        observer.next(msgs);
      });

      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  createNewRoom(newRoom){
    const headerTypes = new Headers();
    headerTypes.append('Content-type', 'application/json');
    return this.http.post(this.newChatUrl, newRoom, {headers: headerTypes})
      .map(res => res.json());
  }
  changeRoom(newRoom){
    this.socket.emit('change room', newRoom);
  }

  //Create observable of chatrooms. Makes us subscribe to it from the component and update with new data
  getAllChatrooms(): Observable<Chatroom[]>{
    const observableChatrooms = new Observable<Chatroom[]>(observer => {
      this.socket.on('refresh chatrooms', (refresh) => {
        observer.next(refresh);
      });

      return () => {
        this.socket.disconnect();
      };
    });
    return observableChatrooms;
  }


}
