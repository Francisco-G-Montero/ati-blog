import React, { Component } from "react";
import { listPosts } from "../graphql/queries";
import { API, Auth, graphqlOperation } from "aws-amplify"; //nos permite ir a buscar de la API las queries o mutations de aws
import DeletePost from "./DeletePost";
import EditPost from "./EditPost";
import {
  onCreateComment,
  onCreateLike,
  onCreatePost,
  onDeletePost,
  onUpdatePost,
} from "../graphql/subscriptions";
import CreateCommentPost from "./CreateCommentPost";
import CommentPost from "./CommentPost";
import { FaThumbsUp } from "react-icons/fa";
import { createLike } from "../graphql/mutations";

class DisplayPosts extends Component {
  state = {
    ownerId: "",
    ownerUsername: "",
    errorMessage: "",
    postLikedBy: [],
    isHovering: false,
    posts: [],
  };
  componentDidMount = async () => {
    this.getPosts();

    await Auth.currentUserInfo().then((user) => {
      this.setState({
        ownerId: user.attributes.sub,
        ownerUsername: user.username,
      });
    });

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

    this.createPostCommentListener = API.graphql(
      graphqlOperation(onCreateComment)
    ).subscribe({
      next: (commentData) => {
        const createdComment = commentData.value.data.onCreateComment;
        let posts = [...this.state.posts];
        for (let post of posts) {
          if (createdComment.post.id === post.id) {
            post.comments.items.push(createdComment);
          }
        }
        this.setState({ posts });
      },
    });

    this.createPostLikeListener = API.graphql(
      graphqlOperation(onCreateLike)
    ).subscribe({
      next: (postData) => {
        const createdLike = postData.value.data.onCreateLike;
        let posts = [...this.state.posts];
        for (let post of posts) {
          if (createdLike.post.id === post.id) {
            post.likes.items.push(createdLike);
          }
        }
        this.setState({ posts });
      },
    });
  };

  componentWillUnmount() {
    this.createPostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
    this.updatePostListener.unsubscribe();
    this.createPostCommentListener.unsubscribe();
    this.createPostLikeListener.unsubscribe();
  }

  getPosts = async () => {
    const result = await API.graphql(graphqlOperation(listPosts));
    this.setState({ posts: result.data.listPosts.items });
  };

  likedPost = (postId) => {
    for (let post of this.state.posts) {
      if (post.id === postId) {
        if (post.postOwnerUsername === this.state.ownerId) return true;

        for (let like of post.likes.items) {
          if (like.likeOwnerId === this.state.ownerId) return true;
        }
      }
    }
  };

  handleLike = async (postId) => {
    if (this.likedPost(postId)) {
      this.setState({ errorMessage: "You can't like your own post" });
    } else {
      const input = {
        numberLikes: 1,
        likeOwnerId: this.state.ownerId,
        likeOwnerUsername: this.state.ownerUsername,
        likePostId: postId,
      };
      try {
        await API.graphql(graphqlOperation(createLike, { input }));
        //const result = await API.graphql(graphqlOperation(createLike, { input }));
        //console.log("post likeado: ", result.data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  render() {
    //const posts=this.state.posts lo de abajo es igual!
    const { posts } = this.state; // metodo desconstruido!
    let loggedInUser = this.state.ownerId;

    return posts.map((post) => {
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
            {post.postOwnerId === loggedInUser && (
              <>
                <DeletePost data={post} />
                <EditPost {...post} />
              </>
            )}
            <span>
              <p className="alert">
                <strong>
                  {post.postOwnerId === loggedInUser && this.state.errorMessage}
                </strong>
              </p>
              <p onClick={() => this.handleLike(post.id)}>
                <FaThumbsUp /> {post.likes.items.length}
              </p>
            </span>
          </span>
          <span>
            <CreateCommentPost postId={post.id} />
            {post.comments.length > 0 && (
              <span style={{ fontSize: "19px", color: "gray" }}>Comments:</span>
            )}
            {post.comments.items.map((comment, index) => (
              <CommentPost key={index} commentData={comment} />
            ))}
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
