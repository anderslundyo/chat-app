import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { Message } from '../../models/message';
import { Chatroom } from '../../models/chatroom';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [ChatService]
})
export class ChatComponent implements OnInit {
  name: String = JSON.parse(localStorage.getItem('user')).name;
  username: String;
  message: String;
  roomName: String;
  currentRoom = '1';
  public chatMessages = [];
  public chatrooms = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit() {
    // Set the current room
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['currentRoom']) {
        this.currentRoom = params['currentRoom'];
        console.log('current room is: ', this.currentRoom);
      }
    });
    //Connect to chat
    this.connectToChat();
    //Get all chatrooms in a list
    this.getAllChatrooms();
    //Get messages, and parse currentRoom as a paramter, so only messages in the chatroom in shown
    this.getMsgInRoom(this.currentRoom);
  }

  connectToChat() {
    console.log(this.name +' is now online!');
    //Parse to chatservice with name parameter
    this.chatService.connectToChat(this.name);
  }

  //Change chatroom, call methods to update content
  changeRoom(chatroom) {
    this.currentRoom = chatroom;
    this.chatService.changeRoom(this.currentRoom);
    this.getAllChatrooms();
    this.getMsgInRoom(this.currentRoom);
  }

  //Create new message
  submitMessage() {
    const newMessage: Message = {
      name: this.name,
      message: this.message,
      chatroom: this.currentRoom
    };
    //Check to see if name passes correctly
    console.log(this.name + " send a new message");
    this.chatService.submitMessage(newMessage).subscribe();
  }


  // Chatroom stuff goes here
  createNewRoom() {
    console.log('input was: ' +this.roomName);
    const newRoom: Chatroom = {
      roomname: this.roomName
    };
    this.chatService.createNewRoom(newRoom).subscribe();
  }

    //Get all messages in current room
    getMsgInRoom(roomName) {
      this.chatService.getMsgInRoom(roomName)
        .subscribe(
          messages => {
            this.chatMessages = messages;
          }
        );
    }

    
  getAllChatrooms() {
    this.chatService.getAllChatrooms()
      .subscribe(
        chatrooms => {
          this.chatrooms = chatrooms;
        }
      );
  }



}
