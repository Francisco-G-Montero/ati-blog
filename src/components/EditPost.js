import { API, Auth, graphqlOperation } from "aws-amplify";
import React, { Component } from "react";
import { updateImage, updatePost, createImage } from "../graphql/mutations";
import { Storage } from "aws-amplify";
import ImagePost from "./ImagePost";
import AwesomeComponent from "./AwesomeComponent ";

class EditPost extends Component {
  constructor(props) {
    super(props);
    this.postImage = React.createRef();
    this.loadingBar = React.createRef();
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
    storageImg: {
      fileUrl: "",
      file: "",
      filename: this.props.images.items.imageName,
    },
  };

  handleChange = (e) => {
    const file = e.target.files[0];
    this.setState({
      storageImg: {
        fileUrl: URL.createObjectURL(file),
        file,
        filename: file.name,
      },
    });
    this.postImage.current.setState({
      storageImg: { fileUrl: URL.createObjectURL(file) },
    });
  };

  saveImage = () => {
    const file = this.state.storageImg.file;
    const path = this.state.storageImg.filename;

    Storage.put(path, file)
      .then(async () => {
        console.log("La imagen ha sido guardada al Storage exitosamente");
        this.setState({ storageImg: { fileUrl: "", file: "", filename: "" } });
        if (this.props.images.items[0]) {
          const input = {
            id: this.props.images.items[0].id,
            imageName: path,
            imageUrl: path,
          };
          API.graphql(graphqlOperation(updateImage, { input })).then(() => {
            console.log("imagen editada exitosamente");
            this.updatePost();
          });
        } else {
          const input = {
            imageName: path,
            imageUrl: path,
            imagePostId: this.props.id,
          };
          API.graphql(graphqlOperation(createImage, { input })).then(() => {
            console.log("imagen creada exitosamente");
          });
          this.updatePost();
        }
      })
      .catch((err) => {
        console.log("Hubo un error al guardar la imagen al Storage", err);
      });
  };
  updatePost = () => {
    const input = {
      id: this.props.id,
      postOwnerId: this.state.postOwnerId,
      postOwnerUsername: this.state.postOwnerUsername,
      postTitle: this.state.postData.postTitle,
      postBody: this.state.postData.postBody,
    };
    API.graphql(graphqlOperation(updatePost, { input })).then(() => {
      this.setState({ show: !this.state.show });
    });
  };

  handleModal = () => {
    this.setState({ show: !this.state.show });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  handleUpdatePost = async (event) => {
    event.preventDefault();
    this.loadingBar.current.setState({ loading: true });
    this.saveImage();
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

  componentDidMount = async () => {
    if (this.props.images.items[0]) {
      Storage.get(this.props.images.items[0].imageName).then((data) => {
        this.setState({
          storageImg: { fileUrl: data },
        });
      });
    }
  };
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
              <input
                type="file"
                onChange={this.handleChange}
                accept="image/x-png,image/gif,image/jpeg,image/png"
              />
              {this.props.images.items.map((image, index) => (
                <ImagePost
                  ref={this.postImage}
                  key={index}
                  imageData={image}
                  hidden
                />
              ))}
              <div>
                <button style={{ float: "left" }}>Editar Post</button>
                <AwesomeComponent ref={this.loadingBar} />
              </div>
            </form>
          </div>
        )}
        <button
          onClick={this.handleModal}
          style={{ border: "none", marginRight: "1px" }}
        >
          {" "}
          Edit{" "}
        </button>
      </>
    );
  }
}
export default EditPost;
