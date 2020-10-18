import React, { Component } from "react";
import { listPosts } from "../graphql/queries";
import { API, graphqlOperation } from "aws-amplify"; //nos permite ir a buscar de la API las queries o mutations de aws
import DeletePost from "./DeletePost";
import EditPost from "./EditPost";
import {
  onCreateComment,
  onCreatePost,
  onDeletePost,
  onUpdatePost,
} from "../graphql/subscriptions";
import CreateCommentPost from "./CreateCommentPost";
import CommentPost from "./CommentPost";

class DisplayPosts extends Component {
  state = {
    posts: [],
  };
  componentDidMount = async () => {
    this.getPosts();

    this.createPostListener = API.graphql(
      graphqlOperation(onCreatePost)
    ).subscribe({
      next: (postData) => {
        const newPost = postData.value.data.onCreatePost;
        const prevPosts = this.state.posts.filter(
          (post) => post.id !== newPost.id
        );
        const updatedPosts = [newPost, ...prevPosts];
        this.setState({ posts: updatedPosts });
      },
    });

    this.deletePostListener = API.graphql(
      graphqlOperation(onDeletePost)
    ).subscribe({
      next: (postData) => {
        const deletedPost = postData.value.data.onDeletePost;
        const updatedPosts = this.state.posts.filter(
          (post) => post.id !== deletedPost.id
        );
        this.setState({ posts: updatedPosts });
      },
    });
    this.updatePostListener = API.graphql(
      graphqlOperation(onUpdatePost)
    ).subscribe({
      next: (postData) => {
        const { posts } = this.state;
        const updatePost = postData.value.data.onUpdatePost;
        const index = posts.findIndex((post) => post.id === updatePost.id);

        const updatedPosts = [
          ...posts.slice(0, index),
          updatePost,
          ...posts.slice(index + 1),
        ];

        this.setState({ posts: updatedPosts });
      },
    });
    this.createPostCommentListener = API.graphql(graphqlOperation(onCreateComment))
      .subscribe({
        next: commentData => {
          const createdComment = commentData.value.data.onCreateComment;
          let posts = [... this.state.posts];
          for( let post of posts ) {
            if (createdComment.post.id === post.id){
              post.comments.items.push(createdComment);
            }
          }
          this.setState({ posts })
        }
      })
  };

  componentWillUnmount() {
    this.createPostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
    this.updatePostListener.unsubscribe();
    this.createPostCommentListener.unsubscribe();
  }

  getPosts = async () => {
    const result = await API.graphql(graphqlOperation(listPosts));
    console.log("Todos los Posts", result.data);
    this.setState({ posts: result.data.listPosts.items });
  };

  render() {
    //const posts=this.state.posts lo de abajo es igual!
    const { posts } = this.state; // metodo desconstruido!
    return posts.map((post) => {
      //retorno un loop agrupando lo de abajo?
      return (
        <div className="posts" key={post.id} style={rowStyle}>
          <h1>{post.postTitle}</h1>
          <span style={{ fontStyle: "italic", color: "#0ca5e287" }}>
            {"Wrote by: "}
            {post.postOwnerUsername}
            <time> {new Date(post.createdAt).toDateString()}</time>
          </span>
          <p>{post.postBody}</p>
          <br></br>
          <span>
            <DeletePost data={post} />
            <EditPost {...post} />
          </span>
          <span>
            <CreateCommentPost postId={post.id}/>
            {post.comments.length > 0 && 
              <span style={{fontSize:'19px', color:'gray'}}>
                Comments: </span>}
                {
                  post.comments.items.map((comment,index) => 
                  <CommentPost key={index} commentData={comment}/>)
                }
          </span>
        </div>
      );
    });
  }
}
const rowStyle = {
  background: "#f4f4f4",
  padding: "10px",
  border: "1px #ccc dotted",
  margin: "14px",
};
export default DisplayPosts;
