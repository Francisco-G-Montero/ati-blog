import { API, Auth, graphqlOperation } from "aws-amplify";
import React, { Component } from "react";
import { updatePost } from "../graphql/mutations";
import {Storage} from 'aws-amplify'

  console.log('cargando imagen0')
  let imageUrl =Storage.get('public/550x733_0BA.jpg')

class EditPost extends Component {
 // stateImg= {fileUrl:'',file:'', filename:''}
  handleChange= e=>{
    const file =e.target.files[0];
    this.setState(({
      storageImg:{
          fileUrl: URL.createObjectURL(file),
          file,
          filename: file.name
        }
    }))
  }
  saveFile=()=>{
    Storage.put(this.state.storageImg.filename,this.state.storageImg.file)
      .then(()=>{
        console.log('La imagen ha sido guardada exitosamente')
        this.setState({storageImg:{fileUrl:'',file:'',filename:''}})
      }).catch(err=>{
        console.log('Hubo un error al guardar la imagen',err)
      })
  }



  state = {
    show: false,
    id: "",
    postOwnerId: "",
    postOwnerUsername: "",
    postTitle: "",
    postBody: "",
    postData: {
      postTitle: this.props.postTitle,
      postBody: this.props.postBody,
    },
    storageImg:{fileUrl:'',file:'', filename:''}
  };

  handleModal = () => {
    this.setState({ show: !this.state.show });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  handleUpdatePost = async (event) => {
    event.preventDefault();
    const input = {
      id: this.props.id,
      postOwnerId: this.state.postOwnerId,
      postOwnerUsername: this.state.postOwnerUsername,
      postTitle: this.state.postData.postTitle,
      postBody: this.state.postData.postBody,
    };
    await API.graphql(graphqlOperation(updatePost, { input }));
    this.setState({ show: !this.state.show });
  };

  handleTitle = (event) => {
    this.setState({
      postData: {
        ...this.state.postData,
        postTitle: event.target.value,
      },
    });
  };
  handleBody = (event) => {
    this.setState({
      postData: {
        ...this.state.postData,
        postBody: event.target.value,
      },
    });
  };
   /*handleImage(){
    console.log('cargando imagen0')
    let imageUrl =Storage.get('public/550x733_0BA.jpg')
    this.setState({
      storageImg:{fileUrl:imageUrl}
    })
    console.log('cargando imagen',imageUrl)
  }
  asd(){
    console.log('cargando imagen0')
  }*/
  componentDidMount = async () =>{
    Storage.get('Victoria.png')
    .then(data => {
      this.setState({
        storageImg:{fileUrl:data}
      })
      
    console.log('hola',data)
    })
  }
  componentWillMount = async () => {
   
    await Auth.currentUserInfo().then((user) => {
      this.setState({
        postOwnerId: user.attributes.sub,
        postOwnerUsername: user.username,
      });
    });
  };

  render() {
    return (
      <>
        {this.state.show && (
          <div className="modal">
            <button className="close" onClick={this.handleModal}>
              X
            </button>
            <form
              className="add-post"
              onSubmit={(event) => this.handleUpdatePost(event)}
            >
              <input
                style={{ fontSize: "19px" }}
                placeholder="Title"
                type="text"
                name="postTitle"
                value={this.state.postData.postTitle}
                onChange={this.handleTitle}
              />
              <input
                style={{ height: "150px", fontSize: "19px" }}
                type="text"
                name="postBody"
                value={this.state.postData.postBody}
                onChange={this.handleBody}
              />
               <input type="file" onChange={this.handleChange} accept="image/x-png,image/gif,image/jpeg,image/png"/>
              <img src={this.state.storageImg.fileUrl} alt="postImage" onChange={this.handleImage} style={{height:'200px',width:'400px'}}/>

              <button onClick={this.saveFile}>Guardar imagen</button>

              <button>Editar Post</button>
             
            </form>
        
          </div>
        )}
        <button
          onClick={this.handleModal}
          style={{ border: "none", marginRight: "1px" }}
        >
          Edit
        </button>
      </>
    );
  }
}
export default EditPost;
