import { API, graphqlOperation, Auth } from 'aws-amplify';
import React, { Component } from 'react';
import { createPost,createImage } from '../graphql/mutations';
import {Storage} from 'aws-amplify'

class CreatePost extends Component {
  
  constructor(props) {
    super(props);
    this.postImage = React.createRef();
  }
  state = {
    postOwnerId: '',
    postOwnerUsername: '',
    postTitle: '',
    postBody: '',
    storageImg:{fileUrl:'',file:'', filename:''}
  };
  componentDidMount = async () => {
    //Todo: Auth
    await Auth.currentUserInfo().then((user) => {
      this.setState({
        postOwnerId: user.attributes.sub,
        postOwnerUsername: user.username,
      });
    });
  };
  handleChangePost = (event) =>
    this.setState({
      [event.target.name]: event.target.value,
    });
  handleAddPost = async (event) => {
    event.preventDefault();
    const input = {
      postOwnerId: this.state.postOwnerId,
      postOwnerUsername: this.state.postOwnerUsername,
      postTitle: this.state.postTitle,
      postBody: this.state.postBody,
      createdAt: new Date().toISOString(),
    };
    await API.graphql(graphqlOperation(createPost, { input }))
      .then(async (dataPost)=>{
        this.saveImage(dataPost)
    });
    this.setState({ postTitle: '', postBody: '' });
  };

  handleImageChange= e=>{
    const file =e.target.files[0];
    this.setState(({
      storageImg:{
          fileUrl: URL.createObjectURL(file),
          file,
          filename: file.name
        }
    }))
    this.postImage.current.hidden=false
  }
  saveImage= async (dataPost)=>{
    const file= this.state.storageImg.file
    const path=this.state.storageImg.filename
    Storage.put(path,file)
      .then(async ()=>{
        console.log('La imagen ha sido guardada al Storage exitosamente')
        this.setState({storageImg:{fileUrl:'',file:'',filename:''}})
        const input = {
          imageName:path,
          imageUrl:path,
          imagePostId:dataPost.data.createPost.id,
        }
        await API.graphql(graphqlOperation(createImage, { input })).then(()=>{console.log('post e imagen cargados exitosamente')});
        this.postImage.current.hidden=true
      }).catch(err=>{
        console.log('Hubo un error al guardar la imagen al Storage',err)
      })
  }
  
  render() {
    return (
      <form className="add-post" onSubmit={this.handleAddPost}>
        <input
          style={{ font: '19px' }}
          type="text"
          placeholder="Título"
          name="postTitle"
          required
          value={this.state.postTitle}
          onChange={this.handleChangePost}
        ></input>
        <textarea
          type="text"
          name="postBody"
          rows="3"
          cols="40"
          placeholder="Contenido del post!"
          required
          value={this.state.postBody}
          onChange={this.handleChangePost}
        />
          <input type="file" onChange={this.handleImageChange} accept="image/x-png,image/gif,image/jpeg,image/png"/>
          <div className="imageDiv">
                <span>
                <img className="imagePost" ref={this.postImage} src={this.state.storageImg.fileUrl} alt="postImage" onChange={this.handleImage} style={{height:'200px',width:'auto',borderRadius:'10px',maxWidth:'700px'}} hidden/>
                </span>
            </div>
        <input
          type="submit"
          className="Btn"
          style={{ fontSize: '19px' }}
        ></input>
      </form>
    );
  }
}
export default CreatePost;
