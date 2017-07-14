/*只要 input.value 被用户改了，data.newTodo 就会变成一样的值；*/
/*只要 data.newTodo 被 JS 改了，input.value 就会变成一样的值。*/


//masterkey :waRTHCjEHt6uXP27c9sVPW20
import Vue from 'vue'
import AV from 'leancloud-storage'

//我的
var APP_ID = 'e5qmbw13JBLBpdjwnXydrYhT-gzGzoHsz';
var APP_KEY = 'DE6vkreJEIVS4oadzEURLevB';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});


//测试代码
// var TestObject = AV.Object.extend('TestObject');
// var testObject = new TestObject();
// testObject.save({
//   words: 'Hello World!'
// }).then(function(object) {
//   alert('LeanCloud Rocks!');
// })

var app = new Vue({
  el: '#app',
  data: {
    formData: {
      username: '',
      password: ''
    },
    actionType: 'signUp',
    newTodo: '',
    todoList: [],
    currentUser: null,  // 👈
  },

  //使用localStorage存储用户输入
  created: function () {
    // onbeforeunload文档：https://developer.mozilla.org/zh-CN/docs/Web/API/Window/onbeforeunload
    window.onbeforeunload = () => {
      let dataString = JSON.stringify(this.todoList) // JSON 文档: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON
      window.localStorage.setItem('myTodos', dataString) // 看文档https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage
    }

    let oldDataString = window.localStorage.getItem('myTodos')
    let oldData = JSON.parse(oldDataString)
    this.todoList = oldData || []
    this.currentUser = this.getCurrentUser();
  },

  //
  methods: {
    addTodo: function () {
      this.todoList.push({
        title: this.newTodo,
        createdAt: new Date(),
        done: false // 添加一个 done 属性
      })
      this.newTodo = ''
    },

    // 加了👇这个函数,删除代办
    removeTodo: function (todo) {
      let index = this.todoList.indexOf(todo) // Array.prototype.indexOf 是 ES 5 新加的 API
      this.todoList.splice(index, 1) // 不懂 splice？赶紧看 MDN 文档！
    },

    //
    signUp: function () {
      let user = new AV.User();
      user.setUsername(this.formData.username);
      user.setPassword(this.formData.password);
      user.signUp().then((loginedUser) => { // 👈，将 function 改成箭头函数，方便使用 this
        this.currentUser = this.getCurrentUser() // 👈
      }, (error) => {
        alert('注册失败') // 👈
      });
    },
    login: function () {
      AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) => { // 👈
        this.currentUser = this.getCurrentUser() // 👈
      }, function (error) {
        alert('登录失败') // 👈
      });
    },
    getCurrentUser: function () { // 👈
      let current = AV.User.current()
      if (current) {
        let { id, createdAt, attributes: { username } } = current
        return { id, username, createdAt } 
      } else {
        return null
      }
    },
    logout: function () {
      AV.User.logOut()
      this.currentUser = null
      window.location.reload()
    }


  }//methods
})//new Vue()