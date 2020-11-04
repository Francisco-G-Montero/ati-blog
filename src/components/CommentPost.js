import React, {Component} from 'react';

class CommentPost extends Component{
    render (){
        const {content, commentOwnerUsername, createdAt} = this.props.commentData;
        return (
            <div className="comment">
                <span style={{ fontStyle: "italic", color: "#0ca5e297"}}>
                    {"Por: "}{commentOwnerUsername}
                    {" on "}
                    <time style={{fontStyle: "italic"}}>
                        {" "}
                        
                        {new Date(createdAt).toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                </span>
                <p>{content}</p>
            </div>
        )
    }
}
export default CommentPost;