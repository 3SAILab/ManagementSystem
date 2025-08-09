import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
import logging
import email.utils
from backend.config import settings

logger = logging.getLogger(__name__)

class EmailSender:
    def __init__(self):
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.username = settings.EMAIL_USERNAME
        self.password = settings.EMAIL_PASSWORD
        self.email_from = settings.EMAIL_FROM

    def send_email(self, to_email: str, subject: str, content: str, content_type: str = "plain") -> bool:
        """
        发送邮件
        """
        try:
            msg = MIMEMultipart()
            from_header = email.utils.formataddr((self.email_from, self.email_from))
            msg['From'] = from_header
            msg['To'] = Header(to_email, 'utf-8')
            msg['Subject'] = Header(subject, 'utf-8')
            msg.attach(MIMEText(content, content_type, 'utf-8'))

            # 连接SMTP服务器
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            # 启用TLS加密
            server.starttls()
            # 登录
            server.login(self.username, self.password)
            # 发送邮件
            server.send_message(msg)
            logger.info(f"邮件发送成功: {to_email}")
            # 退出连接
            server.quit()
            
            return True

        except smtplib.SMTPAuthenticationError as e:
            # 专门捕获认证错误
            logger.error(f"SMTP 认证失败 (用户名: {self.username}): {e.smtp_code}, {e.smtp_error}")
            return False
        except smtplib.SMTPConnectError as e:
            # 专门捕获连接错误 (虽然 Test-NetConnection 成功，但这里可能有更细的差别)
            logger.error(f"SMTP 连接错误: {e}")
            return False
        except smtplib.SMTPException as e:
            # 捕获其他 SMTP 相关错误
            logger.error(f"SMTP 协议错误: {e}")
            return False
        except Exception as e:
            # 捕获所有其他非 SMTP 错误
            logger.error(f"邮件发送失败: {to_email}, 发生未预期的错误: {type(e).__name__}: {str(e)}")
            return False
    def send_verification_code(self, to_email: str, code: str, purpose: str = "general") -> bool:
        """
        发送验证码邮件
        """
        # 根据用途定制邮件内容
        subject_map = {
            "register": "注册验证码",
            "login": "登录验证码", 
            "reset_password": "重置密码验证码",
            "general": "验证码"
        }
        
        content_map = {
            "register": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #007bff;">欢迎注册我们的服务</h2>
                    <p>您好！感谢您注册我们的服务。</p>
                    <p>您的注册验证码是：</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #1890ff; 
                              padding: 15px 25px; border: 2px dashed #1890ff; border-radius: 8px;">
                            {code}
                        </span>
                    </div>
                    <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <strong>提示：</strong>验证码有效期为 {settings.CODE_EXPIRE_MINUTES} 分钟，请及时使用。
                    </p>
                    <p>如非本人操作，请忽略此邮件。</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        此邮件由系统自动发送，请勿回复。
                    </p>
                </div>
            </body>
            </html>
            """,
            "login": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #007bff;">登录验证码</h2>
                    <p>您好！您正在尝试登录我们的服务。</p>
                    <p>您的登录验证码是：</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #1890ff; 
                              padding: 15px 25px; border: 2px dashed #1890ff; border-radius: 8px;">
                            {code}
                        </span>
                    </div>
                    <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <strong>提示：</strong>验证码有效期为 {settings.CODE_EXPIRE_MINUTES} 分钟，请及时使用。
                    </p>
                    <p>如非本人操作，请忽略此邮件。</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        此邮件由系统自动发送，请勿回复。
                    </p>
                </div>
            </body>
            </html>
            """,
            "reset_password": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #007bff;">重置密码验证码</h2>
                    <p>您好！您正在重置账户密码。</p>
                    <p>您的验证码是：</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #1890ff; 
                              padding: 15px 25px; border: 2px dashed #1890ff; border-radius: 8px;">
                            {code}
                        </span>
                    </div>
                    <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <strong>提示：</strong>验证码有效期为 {settings.CODE_EXPIRE_MINUTES} 分钟，请及时使用。
                    </p>
                    <p>如非本人操作，请忽略此邮件。</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        此邮件由系统自动发送，请勿回复。
                    </p>
                </div>
            </body>
            </html>
            """,
            "general": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #007bff;">验证码</h2>
                    <p>您好！您正在使用我们的服务。</p>
                    <p>您的验证码是：</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #1890ff; 
                              padding: 15px 25px; border: 2px dashed #1890ff; border-radius: 8px;">
                            {code}
                        </span>
                    </div>
                    <p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <strong>提示：</strong>验证码有效期为 {settings.CODE_EXPIRE_MINUTES} 分钟，请及时使用。
                    </p>
                    <p>如非本人操作，请忽略此邮件。</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #666;">
                        此邮件由系统自动发送，请勿回复。
                    </p>
                </div>
            </body>
            </html>
            """
        }
        
        subject = subject_map.get(purpose, subject_map["general"])
        content = content_map.get(purpose, content_map["general"])
        
        return self.send_email(to_email, subject, content, "html")